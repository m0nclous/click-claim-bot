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
import { TelegramService } from '#services/TelegramService';

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
                    telegram?: TelegramService;
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

                state.telegram = await app.container.make('telegram', [ctx.message.from.id]);
                state.client = await state.telegram.getClient();
                state.phoneNumber = ctx.message.contact.phone_number;
                state.codeCallback = callbackPromise();
                state.passwordCallback = callbackPromise();
                state.onLoginCallback = callbackPromise();

                const codePromise = state.codeCallback.promise;
                const passwordPromise = state.passwordCallback.promise;

                state.client
                    .start({
                        phoneNumber: state.phoneNumber,
                        password: async () => passwordPromise,
                        phoneCode: async () => codePromise,
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

                await ctx.reply('Введите код для входа в <a href="https://t.me/+42777">Telegram</a>\n\n❗️ Внимание! Раздели код пробелами, например <code>1 2 3 4 5 6</code>, иначе код будет недействительным!', {
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

                const phoneCode: string = ctx.message.text.replaceAll(' ', '').trim();

                state.codeCallback?.resolve(phoneCode);

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
                    telegram?: TelegramService;
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
                await state.telegram?.saveSession(state.client?.session.save() as unknown as string);

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
