import type { Logger } from '@adonisjs/core/logger';
import { RedisService } from '@adonisjs/redis/types';
import app from '@adonisjs/core/services/app';
import { Context, Telegraf } from 'telegraf';
import { parseBoolean } from '../../helpers/parse.js';
// @ts-ignore
import type { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

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
        this.bot.command('start', this.start.bind(this));
        this.bot.command('stop', this.stop.bind(this));
        this.bot.command('info', this.info.bind(this));

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

    public async sendMessage(chatId: number | string, text: string, extra?: ExtraReplyMessage) {
        await this.bot.telegram.sendMessage(chatId, text, extra);
    }
}

let telegramBot: TelegramBotService;

await app.booted(async () => {
    telegramBot = await app.container.make('telegramBot');
});

export { telegramBot as default };
