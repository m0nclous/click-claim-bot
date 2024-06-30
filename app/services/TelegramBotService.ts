import type { Logger } from '@adonisjs/core/logger';
import { RedisService } from '@adonisjs/redis/types';
import app from '@adonisjs/core/services/app';
import { Context, Markup, Scenes, session, Telegraf } from 'telegraf';
import { parseBoolean } from '../../helpers/parse.js';
// @ts-expect-error почему-то ругается на то что не может найти модуль
import type { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { SceneContext, SceneContextScene } from 'telegraf/scenes';

const LAUNCH_COMMAND = 'Запуск 🚀';
const STOP_COMMAND = 'Остановить ⛔';
const INFO_COMMAND = 'Информация ℹ️';

export interface TelegramBotConfig {
    token: string;
}

export function defineConfig(config: TelegramBotConfig): TelegramBotConfig {
    return config;
}

export class TelegramBotService {
    public bot: Telegraf<Scenes.SceneContext & Context>;
    private readonly loginScene: Scenes.BaseScene<Scenes.SceneContext>;
    private readonly menuScene: Scenes.BaseScene<Scenes.SceneContext>;

    constructor(
        public config: TelegramBotConfig,
        protected redis: RedisService,
        protected logger: Logger,
    ) {
        this.bot = new Telegraf<Scenes.SceneContext>(this.config.token);

        this.menuScene = new Scenes.BaseScene<Scenes.SceneContext>("menu");
        this.loginScene = new Scenes.BaseScene<Scenes.SceneContext>("login");

        const stage = new Scenes.Stage<Scenes.SceneContext>([this.menuScene, this.loginScene], {
            ttl: 10,
        });

        this.bot.use(session());
        this.bot.use(stage.middleware());
        this.menuScene.enter(ctx => ctx.reply('Добро пожаловать в бота!',
            {
                ...Markup.keyboard([
                    LAUNCH_COMMAND,
                    STOP_COMMAND,
                    INFO_COMMAND,
                ])
            }));
        this.menuScene.hears(LAUNCH_COMMAND, this.launch.bind(this));
        this.menuScene.hears(STOP_COMMAND, this.stop.bind(this));
        this.menuScene.hears(INFO_COMMAND, this.info.bind(this));

        this.loginScene.enter(ctx => ctx.replyWithHTML(
            'Sign In with <b>Telegram</b>',
            {
                ...Markup.inlineKeyboard([
                    Markup.button.login('Sign In', 'https://c5a3-198-71-57-94.ngrok-free.app', {
                        bot_username: "click_claim_serhio_bot",
                        request_write_access: true,
                    })
                ])
            }
        ))
    }

    public async run(): Promise<void> {
        this.bot.command('launch', this.launch.bind(this));
        this.bot.command('stop', this.stop.bind(this));
        this.bot.command('authorize', this.authorize.bind(this));

        this.bot.start(ctx => {
            console.log(ctx.payload);
            console.log(ctx);
            return ctx.scene.enter('login')
        });

        this.bot.launch().then();
    }

    public async isStarted(userId: number): Promise<boolean> {
        return parseBoolean(await this.redis.hget(`user:${userId}:bot`, 'started'));
    }

    public async launch(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await this.redis.hset(`user:${ctx.from.id}:bot`, 'started', 1);
        await ctx.reply('Бот запущен');
    }

    public async stop(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await this.redis.hset(`user:${ctx.from.id}:bot`, 'started', '0');
        await ctx.reply('Бот остановлен');
    }

    public async info(ctx: Context): Promise<void> {
        if (!ctx.from?.id) {
            this.logger.error(ctx, 'Не найден ID пользователя');
            await ctx.reply('Ошибка, попробуйте позже');
            return;
        }

        await ctx.reply(`Started: ${await this.isStarted(ctx.from.id)}`);
    }

    public async authorize(ctx: Context & { scene: SceneContextScene<SceneContext> }): Promise<void> {
        console.log(ctx);
        await ctx.scene.enter('menu');
    }

    public async sendMessage(chatId: number | string, text: string, extra?: ExtraReplyMessage) {
        await this.bot.telegram.sendMessage(chatId, text, extra);
    }
}

let telegramBot: TelegramBotService;

await app.booted(async () => {
    telegramBot = await app.container.make('telegramBot');
});

export { telegramBot as default };
