import app from '@adonisjs/core/services/app';
import { Markup, Scenes, session, Telegraf } from 'telegraf';
import { parseBoolean, parseNumbers } from '#helpers/parse';
import { callbackPromise } from '#helpers/promise';

import type { Logger } from '@adonisjs/core/logger';
import type { RedisService } from '@adonisjs/redis/types';
import type { Context } from 'telegraf';
import type { UserFromGetMe } from '@telegraf/types/manage.js';
import type { TelegramClient } from 'telegram';
import type { TelegramService } from '#services/TelegramService';
import type { ICallbackPromise } from '#helpers/promise';
import type { BaseBotService } from '#services/BaseBotService';

export class TelegramBotService {
    public bot: Telegraf;

    constructor(
        public config: TelegramBotConfig,
        protected redis: RedisService,
        protected logger: Logger,
    ) {
        this.bot = new Telegraf(this.config.token);
    }

    public async run(): Promise<UserFromGetMe> {
        await this.setupLoginWizard();
        await this.setupCommands();

        return new Promise((resolve, reject) => {
            this.bot.launch(() => {
                if (this.bot.botInfo !== undefined) {
                    resolve(this.bot.botInfo);
                } else {
                    reject('Bot info is undefined');
                }
            });
        });
    }

    protected async setupCommands() {
        this.bot.command('start', this.start.bind(this));
        this.bot.command('login', this.login.bind(this));
        this.bot.command('logout', this.logout.bind(this));
        this.bot.command('enable', this.enable.bind(this));
        this.bot.command('disable', this.disable.bind(this));
        this.bot.command('status', this.status.bind(this));

        this.bot.command('bot_mtk_click_start', this.botMtkClickStart.bind(this));
        this.bot.command('bot_mtk_click_stop', this.botMtkClickStop.bind(this));

        this.bot.command('bot_gemz_click_start', this.botGemzClickStart.bind(this));
        this.bot.command('bot_gemz_click_stop', this.botGemzClickStop.bind(this));

        this.bot.command('bot_mtk_daily_start', this.botMtkDailyStart.bind(this));
        this.bot.command('bot_mtk_daily_stop', this.botMtkDailyStop.bind(this));

        this.bot.command('bot_gemz_daily_start', this.botGemzDailyStart.bind(this));
        this.bot.command('bot_gemz_daily_stop', this.botGemzDailyStop.bind(this));

        this.bot.command('bot_zavod_claim_start', this.zavodClaimStart.bind(this));
        this.bot.command('bot_zavod_claim_stop', this.zavodClaimStop.bind(this));

        return this.bot.telegram.setMyCommands([
            {
                command: 'login',
                description: 'Привязать Telegram аккаунт',
            },
            {
                command: 'logout',
                description: 'Отвязать Telegram аккаунт',
            },
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
            {
                command: 'bot_mtk_click_start',
                description: 'Запустить кликер MTK',
            },
            {
                command: 'bot_mtk_click_stop',
                description: 'Остановить кликер MTK',
            },
            {
                command: 'bot_gemz_click_start',
                description: 'Запустить кликер Gemz',
            },
            {
                command: 'bot_gemz_click_stop',
                description: 'Остановить кликер Gemz',
            },
            {
                command: 'bot_mtk_daily_start',
                description: 'Запустить сбор ежедневной награды MTK',
            },
            {
                command: 'bot_mtk_daily_stop',
                description: 'Остановить сбор ежедневной награды MTK',
            },
            {
                command: 'bot_gemz_daily_start',
                description: 'Запустить сбор ежедневной награды Gemz',
            },
            {
                command: 'bot_gemz_daily_stop',
                description: 'Остановить сбор ежедневной награды Gemz',
            },
            {
                command: 'bot_zavod_claim_start',
                description: 'Запустить сбор награды Zavod',
            },
            {
                command: 'bot_zavod_claim_stop',
                description: 'Остановить сбор награды Zavod',
            },
        ]);
    }

    protected async setupLoginWizard() {
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

                await state.client.connect();

                if (await state.client.isUserAuthorized()) {
                    await ctx.reply('Telegram аккаунт уже привязан\nИспользуйте /logout для выхода');
                    return ctx.scene.leave();
                }

                const message: string = 'Нажмите кнопку "Отправить номер телефона"';
                const keyboard = Markup.keyboard([
                    [
                        {
                            text: '📲 Отправить номер телефона',
                            request_contact: true,
                        },
                    ],
                ]).oneTime(true);

                await ctx.reply(message, keyboard);

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

                const message: string =
                    'Введите код для входа в <a href="https://t.me/+42777">Telegram</a>' +
                    '\n\n❗️ Внимание!' +
                    '\nРаздели код пробелами, например <code>1 2 3 4 5 6</code>\n' +
                    'Иначе код будет недействительным!';

                await ctx.replyWithHTML(
                    message,
                    Markup.inlineKeyboard([
                        [
                            {
                                text: 'Посмотреть код',
                                url: 'https://t.me/+42777',
                            },
                        ],
                    ]),
                );

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
                const phoneCode: string = parseNumbers(ctx.message.text);

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

        const stage = new Scenes.Stage<any>([loginWizard]);

        this.bot.use(session());
        this.bot.use(stage.middleware());
    }

    public async isStarted(userId: number): Promise<boolean> {
        return parseBoolean(await this.redis.hget(`user:${userId}:bot`, 'started'));
    }

    public async start(ctx: Context): Promise<void> {
        const message: string =
            'Привет\\! Я умею тапать и клеймить игры вместо тебя\\!\n\n' +
            'Чтобы начать — мне необходимо войти в твой Telegram\n' +
            'Так я смогу открывать твои игры и собирать награды\\.\n\n' +
            'Чтобы начать процесс привязки Telegram аккаунта\n' +
            'Используй команду /login';

        await ctx.replyWithMarkdownV2(message, Markup.removeKeyboard());
    }

    public async login(ctx: Context): Promise<void> {
        // @ts-expect-error scene на самом деле есть, надо будет поработать с типами
        await ctx.scene.enter('login');
    }

    public async logout(ctx: Context): Promise<void> {
        if (ctx.message === undefined) {
            this.logger.debug(ctx, 'ctx.message is undefined');
            return;
        }

        const telegram: TelegramService = await app.container.make('telegram', [ctx.message.from.id]);

        await telegram.forgetSession();
    }

    public async enable(ctx: Context): Promise<void> {
        if (!(await this.checkUser(ctx))) return;

        await this.redis.hset(`user:${ctx.from!.id}`, 'started', 1);
        await this.redis.lpush('bot:started', ctx.from!.id);
        await ctx.reply('Бот запущен');
    }

    public async disable(ctx: Context): Promise<void> {
        if (!(await this.checkUser(ctx))) return;

        await this.redis.hset(`user:${ctx.from!.id}`, 'started', 0);
        await this.redis.lpop('bot:started', ctx.from!.id);
        await ctx.reply('Бот остановлен');
    }

    public async status(ctx: Context): Promise<void> {
        if (!(await this.checkUser(ctx))) return;

        const telegram: TelegramService = await app.container.make('telegram', [ctx.from?.id]);

        const telegramClient: TelegramClient = await telegram.getClient();
        await telegramClient.connect();

        const hasTelegramSession: boolean = await telegramClient.isUserAuthorized();
        const isStarted: boolean = await this.isStarted(ctx.from!.id);

        const text: string =
            `Телеграм аккаунт привязан: ${hasTelegramSession}\n` + `Бот запущен: ${isStarted}`;

        await ctx.reply(text);
    }

    public async botMtkClickStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'mtkClickBotService');
    }

    public async botMtkClickStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'mtkClickBotService');
    }

    public async botGemzClickStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'gemzClickBotService');
    }

    public async botGemzClickStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'gemzClickBotService');
    }

    public async botMtkDailyStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'mtkDailyBotService');
    }

    public async botMtkDailyStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'mtkDailyBotService');
    }

    public async botGemzDailyStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'gemzDailyBotService');
    }

    public async botGemzDailyStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'gemzDailyBotService');
    }

    public async zavodClaimStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'zavodClaimBotService');
    }

    public async zavodClaimStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'zavodClaimBotService');
    }

    private async enableServiceByUserId(ctx: Context, serviceName: string) {
        const userId: string = ctx.from?.id.toString() || '';

        const service: BaseBotService = await app.container.make(serviceName);
        await service.addUser(userId);
        await service.execute(userId);

        await ctx.react('👌');
    }

    private async stopServiceByUserId(ctx: Context, serviceName: string) {
        const userId: string = ctx.from?.id.toString() || '';

        const service: BaseBotService = await app.container.make(serviceName);
        await service.removeUser(userId);

        await ctx.react('👌');
    }

    private async checkUser(ctx: Context) {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return false;
        }
        return true;
    }
}

let telegramBot: TelegramBotService;

await app.booted(async () => {
    telegramBot = await app.container.make('telegramBot', [0]);
});

export { telegramBot as default };

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
