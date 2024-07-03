import app from '@adonisjs/core/services/app';
import { Scenes, session, Telegraf } from 'telegraf';
import { parseBoolean } from '../../helpers/parse.js';
import { callbackPromise } from '../../helpers/promise.js';

import type { Context } from 'telegraf';
import type { Logger } from '@adonisjs/core/logger';
import type { RedisService } from '@adonisjs/redis/types';
import type { TelegramClient } from 'telegram';
import type { TelegramService } from '#services/TelegramService';
import type { ICallbackPromise } from '../../helpers/promise.js';

export interface TelegramBotConfig {
    token: string;
}

export function defineConfig(config: TelegramBotConfig): TelegramBotConfig {
    return config;
}

export interface ILoginState {
    telegram?: TelegramService;
    client?: TelegramClient;
    phoneNumber?: string;
    codeCallback?: ICallbackPromise<string>;
    passwordCallback?: ICallbackPromise<string>;
    onLoginCallback?: ICallbackPromise<true>;
}

export const parsePhoneCode = (rawPhoneCode: string): string => {
    return rawPhoneCode.replaceAll(' ', '').trim();
};

export class TelegramBotService {
    public bot: Telegraf;

    constructor(
        public config: TelegramBotConfig,
        protected redis: RedisService,
        protected logger: Logger,
    ) {
        this.bot = new Telegraf(this.config.token);
    }

    public async run(): Promise<void> {
        this.bot.command('enable', this.enable.bind(this));
        this.bot.command('disable', this.disable.bind(this));
        this.bot.command('status', this.status.bind(this));

        await this.setupCommandsMenu();

        const loginWizard = new Scenes.WizardScene(
            'login',

            async (ctx) => {
                this.logger.trace(ctx.update, 'Step 1: получение номера телефона');

                if (ctx.message === undefined) {
                    this.logger.debug(ctx, 'ctx.message is undefined');
                    return;
                }

                const state: ILoginState = ctx.wizard.state;

                state.telegram = await app.container.make('telegram', [ctx.message.from.id]);

                state.client = await state.telegram.getClient();

                await ctx.reply('Нажмите кнопку "Отправить номер телефона"', {
                    reply_markup: {
                        keyboard: [
                            [
                                {
                                    text: '📲 Отправить номер телефона',
                                    request_contact: true,
                                },
                            ],
                        ],

                        one_time_keyboard: true,
                    },
                });

                return ctx.wizard.next();
            },

            async (ctx) => {
                this.logger.trace(ctx.update, 'Step 2: получения кода авторизации');

                const state: ILoginState = ctx.wizard.state;

                if (ctx.message === undefined) {
                    this.logger.debug(ctx, 'ctx.message is undefined');
                    return;
                }

                if (!('contact' in ctx.message)) {
                    this.logger.debug(ctx, 'ctx.message.contact is undefined');
                    return;
                }

                state.phoneNumber = ctx.message.contact.phone_number;
                state.codeCallback = callbackPromise<string>();
                state.passwordCallback = callbackPromise();
                state.onLoginCallback = callbackPromise();

                const codePromise: Promise<string> = state.codeCallback.promise;
                const passwordPromise: Promise<string> = state.passwordCallback.promise;
                const onLoginResolve = state.onLoginCallback.resolve;

                if (state.client === undefined) {
                    this.logger.error(ctx, 'state.client is undefined');
                    return;
                }

                state.client
                    .start({
                        phoneNumber: state.phoneNumber,
                        phoneCode: async () => codePromise,
                        password: async () => passwordPromise,
                        onError: async (err: Error) => {
                            throw err;
                        },
                    })
                    .then(() => {
                        onLoginResolve(true);
                    })
                    .catch(async (error: Error) => {
                        this.logger.error(error);
                        await ctx.sendMessage('Не удалось войти в Telegram. Попробуйте еще раз.');
                        await ctx.scene.leave();
                    });

                const text: string =
                    'Введите код для входа в <a href="https://t.me/+42777">Telegram</a>' +
                    '\n\n❗️ Внимание!' +
                    '\nРаздели код пробелами, например <code>1 2 3 4 5 6</code>\n' +
                    'Иначе код будет недействительным!';

                await ctx.reply(text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Посмотреть код',
                                    url: 'https://t.me/+42777',
                                },
                            ],
                        ],
                    },
                });

                return ctx.wizard.next();
            },

            async (ctx) => {
                this.logger.trace(ctx.update, 'Step 3: получение пароля');

                if (ctx.message === undefined) {
                    this.logger.debug(ctx, 'ctx.message is undefined');
                    return;
                }

                if (!('text' in ctx.message)) {
                    this.logger.debug(ctx, 'ctx.message.text is undefined');
                    return;
                }

                const state: ILoginState = ctx.wizard.state;
                const phoneCode: string = parsePhoneCode(ctx.message.text);

                state.codeCallback?.resolve(phoneCode);

                await ctx.reply('Введите облачный пароль Telegram');

                return ctx.wizard.next();
            },

            async (ctx) => {
                this.logger.trace('Step 4: успешное получение сессии Telegram Client');

                if (ctx.message === undefined) {
                    this.logger.debug(ctx, 'ctx.message is undefined');
                    return;
                }

                if (!('text' in ctx.message)) {
                    this.logger.debug(ctx, 'ctx.message.text is undefined');
                    return;
                }

                const state: ILoginState = ctx.wizard.state;

                const password: string = ctx.message.text;
                await ctx.deleteMessage(ctx.message.message_id);

                state.passwordCallback?.resolve(password);
                await state.onLoginCallback?.promise;

                await state.telegram?.saveSession();
                await ctx.reply('Telegram аккаунт успешно привязан');

                return await ctx.scene.leave();
            },
        );

        const stage = new Scenes.Stage<any>([loginWizard], {
            default: 'login',
        });

        this.bot.use(session());
        this.bot.use(stage.middleware());

        loginWizard.use(async (ctx, next) => {
            // Если пришло событие обновления участников чата
            if ('my_chat_member' in ctx.update) {
                // Обработка случаев, когда пользователь остановил бота
                if (['kicked', 'left'].includes(ctx.update.my_chat_member.new_chat_member.status)) {
                    this.logger.trace(ctx.update, 'Бот был удалён из чата (или остановлен)');

                    // Выход со сцены и остановка дальнейших middleware
                    return ctx.scene.leave();
                } else {
                    this.logger.trace(ctx.update, 'Бот был добавлен в чат (или новый собеседник)');
                    return;
                }
            }

            return next();
        });

        return this.bot.launch(() => {
            this.logger.info(this.bot.botInfo, 'Чат-Бот успешно запущен');
        });
    }

    protected async setupCommandsMenu() {
        return this.bot.telegram.setMyCommands([
            {
                command: 'enable',
                description: 'Включить бота',
            },
            {
                command: 'disable',
                description: 'Отключить бота',
            },
            {
                command: 'status',
                description: 'Статус бота',
            },
        ]);
    }

    public async isStarted(userId: number): Promise<boolean> {
        return parseBoolean(await this.redis.hget(`user:${userId}:bot`, 'started'));
    }

    public async enable(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await this.redis.hset(`user:${ctx.from!.id}`, 'started', 1);
        await this.redis.lpush('bot:started', ctx.from!.id);
        await ctx.reply('Бот запущен');
    }

    public async disable(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await this.redis.hset(`user:${ctx.from!.id}`, 'started', 0);
        await this.redis.lpop('bot:started', ctx.from!.id);
        await ctx.reply('Бот остановлен');
    }

    public async status(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        const telegram: TelegramService = await app.container.make('telegram', [ctx.from?.id]);

        const telegramClient: TelegramClient = await telegram.getClient();
        await telegramClient.connect();

        const hasTelegramSession: boolean = await telegramClient.isUserAuthorized();
        const isStarted: boolean = await this.isStarted(ctx.from!.id);

        const text: string =
            `Телеграм аккаунт привязан: ${hasTelegramSession}\n` + `Бот запущен: ${isStarted}`;

        await ctx.reply(text);
    }
}

let telegramBot: TelegramBotService;

await app.booted(async () => {
    telegramBot = await app.container.make('telegramBot', [0]);
});

export { telegramBot as default };
