import type { Logger } from '@adonisjs/core/logger';
import { RedisService } from '@adonisjs/redis/types';
import app from '@adonisjs/core/services/app';
import { Context, Scenes, session, Telegraf } from 'telegraf';
import { parseBoolean } from '../../helpers/parse.js';
// @ts-expect-error почему-то ругается на то что не может найти модуль
import type { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { TelegramService } from '#services/TelegramService';

export interface TelegramBotConfig {
    token: string;
}

export function defineConfig(config: TelegramBotConfig): TelegramBotConfig {
    return config;
}

export class TelegramBotService {
    public bot: Telegraf;
    private readonly loginScene: Scenes.BaseScene<Scenes.SceneContext>;
    private readonly menuScene: Scenes.BaseScene<Scenes.SceneContext>;

    constructor(
        public config: TelegramBotConfig,
        protected redis: RedisService,
        protected logger: Logger,
        protected telegramService: TelegramService,
    ) {
        this.bot = new Telegraf(this.config.token);

        this.menuScene = new Scenes.BaseScene<Scenes.SceneContext>('menu');
        this.loginScene = new Scenes.BaseScene<Scenes.SceneContext>('login');

        // this.loginScene.start(ctx => {
        //     return ctx.reply('Введите номер телефона');
        // })
    }

    public async run(): Promise<void> {
        this.bot.command('start', this.start.bind(this));
        this.bot.command('stop', this.stop.bind(this));
        this.bot.command('info', this.info.bind(this));
        //
        // this.bot.start(async ctx => {
        //     return ctx.scene.enter('login');
        // });

        const phoneCallback = callbackPromise();
        const codeCallback = callbackPromise();
        const passwordCallback = callbackPromise();

        function callbackPromise() {
            let resolve: any;
            let reject: any;

            const promise: Promise<unknown> = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });

            return { promise, resolve, reject };
        }

        const client = await this.telegramService.getClient();
        client
            .start({
                phoneNumber: async () => phoneCallback.promise,
                password: async () => passwordCallback.promise,
                phoneCode: async () => codeCallback.promise,
                onError: (err) => console.error(err),
            })
            .then(async () => {
                console.log('then ================');
                const authToken = client.session.save();
                const me = await client.getMe();
                this.telegramService.saveSession(String(authToken));
            });

        const superWizard = new Scenes.WizardScene(
            'super-wizard',
            async (ctx) => {
                await ctx.reply('Введите номер телефона', {
                    reply_markup: {
                        keyboard: [[{ text: '📲 Send phone number', request_contact: true }]],
                        one_time_keyboard: true,
                    },
                });
                return ctx.wizard.next();
            },
            async (ctx) => {
                ctx.wizard.state.phone = (ctx.message as any).contact.phone_number;
                console.log('ctx.wizard.state.phone === ', ctx.wizard.state.phone);
                phoneCallback.resolve(ctx.wizard.state.phone);
                await ctx.reply('Введите код из приложения');
                return ctx.wizard.next();
            },
            async (ctx) => {
                await ctx.reply('Step 4');
                return ctx.wizard.next();
            },
            async (ctx) => {
                await ctx.reply('Done');
                return await ctx.scene.leave();
            },
        );

        const stage = new Scenes.Stage<Scenes.WizardContext>([superWizard], {
            default: 'super-wizard',
        });

        this.bot.use(session());
        this.bot.use(stage.middleware());

        this.bot.launch().then();
    }

    public async isStarted(userId: number): Promise<boolean> {
        return parseBoolean(await this.redis.hget(`user:${userId}:bot`, 'started'));
    }

    public async start(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await this.redis.hset(`user:${ctx.from!.id}`, 'started', 1);
        await this.redis.lpush('bot:started', ctx.from!.id);
        await ctx.reply('Бот запущен');
    }

    public async stop(ctx: Context): Promise<void> {
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

    // public async login(ctx: Context): Promise<void> {
    //     // const phoneCallback = callbackPromise();
    //     // const codeCallback = callbackPromise();
    //     // const passwordCallback = callbackPromise();
    //     //
    //     // function callbackPromise() {
    //     //     let resolve: any;
    //     //     let reject: any;
    //     //
    //     //     const promise: Promise<unknown> = new Promise((res, rej) => {
    //     //         resolve = res;
    //     //         reject = rej;
    //     //     });
    //     //
    //     //     return { promise, resolve, reject };
    //     // }
    //
    //       const client = await this.telegramService.getClient();
    //       client.start({
    //           phoneNumber: async () => await input.text("Please enter your number: "),
    //           password: async () => await input.text("Please enter your password: "),
    //           phoneCode: async () =>
    //               await input.text("Please enter the code you received: "),
    //           onError: (err) => console.log(err),
    //       }).then(async () => {
    //           const authToken = client.session.save();
    //           const me = await client.getMe();
    //           this.telegramService.saveSession(String(authToken));
    //       });
    // }
}

let telegramBot: TelegramBotService;

await app.booted(async () => {
    telegramBot = await app.container.make('telegramBot', [0]);
});

export { telegramBot as default };
