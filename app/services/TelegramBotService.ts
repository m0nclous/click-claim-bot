import type { Logger } from '@adonisjs/core/logger';
import { RedisService } from '@adonisjs/redis/types';
import app from '@adonisjs/core/services/app';
import { Context, Scenes, session, Telegraf } from 'telegraf';
import { parseBoolean } from '../../helpers/parse.js';

// @ts-expect-error почему-то ругается на то что не может найти модуль
import type { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

// @ts-expect-error интерфейс не экспортирован, но мы его используем
import { MyChatMemberUpdate } from '@telegraf/types/update.js';
import { TelegramClient } from 'telegram';

export interface TelegramBotConfig {
    token: string;
}

export function defineConfig(config: TelegramBotConfig): TelegramBotConfig {
    return config;
}

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
        this.bot.command('play', this.play.bind(this));
        this.bot.command('pause', this.pause.bind(this));
        this.bot.command('info', this.info.bind(this));

        interface ICallbackPromise<T> {
            promise: Promise<T>;
            resolve: any;
            reject: any;
        }

        function callbackPromise<T>(): ICallbackPromise<T> {
            let resolve: any;
            let reject: any;

            const promise: Promise<T> = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });

            return { promise, resolve, reject };
        }

        const loginWizard = new Scenes.WizardScene(
            'login',
            async (ctx) => {
                this.logger.trace(ctx.update, 'Step 1: получение номера телефона');

                await ctx.reply('Введите номер телефона', {
                    reply_markup: {
                        keyboard: [[{ text: '📲 Send phone number', request_contact: true }]],
                        one_time_keyboard: true,
                    },
                });

                return ctx.wizard.next();
            },
            async (ctx) => {
                this.logger.trace(ctx.update, 'Step 2: получения кода авторизации');

                const state: {
                    client?: TelegramClient;
                    phoneNumber?: string;
                    codeCallback?: ICallbackPromise<string>;
                    passwordCallback?: ICallbackPromise<string>;
                    onLoginCallback?: ICallbackPromise<true>;
                } = ctx.wizard.state;

                if (ctx.message === undefined) {
                    return;
                }

                if (!('contact' in ctx.message)) {
                    return;
                }

                const telegramService = await app.container.make('telegram', [ctx.message.from.id]);

                state.phoneNumber = ctx.message.contact.phone_number;
                state.client = await telegramService.getClient();
                state.codeCallback = callbackPromise();
                state.passwordCallback = callbackPromise();
                state.onLoginCallback = callbackPromise();

                const codePromise = state.codeCallback.promise;
                const passwordPromise = state.passwordCallback.promise;

                state.client
                    .start({
                        phoneNumber: state.phoneNumber,
                        password: async () => codePromise,
                        phoneCode: async () => passwordPromise,
                        onError: async (err) => {
                            this.logger.error(err);
                            return true;
                        },
                    })
                    .then(() => {
                        state.onLoginCallback?.resolve(true);
                    })
                    .catch(async () => {
                        await ctx.sendMessage('Не удалось войти в Telegram. Попробуйте еще раз.');
                        await ctx.scene.leave();
                    });

                await ctx.reply('Введите код для входа в <a href="https://t.me/+42777">Telegram</a>', {
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
                    return;
                }

                if (!('text' in ctx.message)) {
                    return;
                }

                const state: {
                    client?: TelegramClient;
                    phoneNumber?: string;
                    codeCallback?: ICallbackPromise<string>;
                    passwordCallback?: ICallbackPromise<string>;
                } = ctx.wizard.state;

                state.codeCallback?.resolve(ctx.message.text);

                await ctx.reply('Введите облачный пароль Telegram');

                return ctx.wizard.next();
            },
            async (ctx) => {
                this.logger.trace('Step 4: успешное получение сессии Telegram Client');

                if (ctx.message === undefined) {
                    return;
                }

                if (!('text' in ctx.message)) {
                    return;
                }

                const state: {
                    client?: TelegramClient;
                    phoneNumber?: string;
                    codeCallback?: ICallbackPromise<string>;
                    passwordCallback?: ICallbackPromise<string>;
                    onLoginCallback?: ICallbackPromise<true>;
                } = ctx.wizard.state;

                const password = ctx.message.text;
                await ctx.deleteMessage(ctx.message.message_id);

                state.passwordCallback?.resolve(password);

                await state.onLoginCallback?.promise;
                await ctx.reply('Успешный вход');
                this.logger.trace({
                    session: state.client?.session.save(),
                    ctx: ctx,
                });

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
                const updateInfo: MyChatMemberUpdate = ctx.update;

                // Обработка случаев, когда пользователь остановил бота
                if (['kicked', 'left'].includes(updateInfo.my_chat_member.new_chat_member.status)) {
                    this.logger.trace(updateInfo, 'Бот был остановлен');

                    // Выход со сцены и остановка дальнейших middleware
                    return ctx.scene.leave();
                }
            }

            return next();
        });

        this.bot
            .launch(() => {
                this.logger.info(this.bot.botInfo, 'Чат-Бот запущен');
            })
            .then();
    }

    public async isStarted(userId: number): Promise<boolean> {
        return parseBoolean(await this.redis.hget(`user:${userId}:bot`, 'started'));
    }

    public async play(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await this.redis.hset(`user:${ctx.from!.id}`, 'started', 1);
        await this.redis.lpush('bot:started', ctx.from!.id);
        await ctx.reply('Бот запущен');
    }

    public async pause(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await this.redis.hset(`user:${ctx.from!.id}`, 'started', 0);
        await this.redis.lpop('bot:started', ctx.from!.id);
        await ctx.reply('Бот остановлен');
    }

    public async info(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await ctx.reply(`Started: ${await this.isStarted(ctx.from!.id)}`);
    }

    public async sendMessage(chatId: number | string, text: string, extra?: ExtraReplyMessage) {
        await this.bot.telegram.sendMessage(chatId, text, extra);
    }
}

let telegramBot: TelegramBotService;

await app.booted(async () => {
    telegramBot = await app.container.make('telegramBot', [0]);
});

export { telegramBot as default };
