import { ApplicationService, LoggerService } from '@adonisjs/core/types';
import { RedisService } from '@adonisjs/redis/types';
import { TelegramBotConfig, TelegramBotService } from '#services/TelegramBotService';
import { TelegramService } from '#services/TelegramService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        telegramBot: TelegramBotService;
    }
}

export default class TelegramProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('telegramBot', async () => {
            const { TelegramBotService } = await import('#services/TelegramBotService');

            const config: TelegramBotConfig = this.app.config.get<TelegramBotConfig>('telegram-bot');
            const telegramService: TelegramService = await this.app.container.make('telegram');
            const logger: LoggerService = await this.app.container.make('logger');
            const redis: RedisService = await this.app.container.make('redis');

            return new TelegramBotService(config, telegramService, redis, logger);
        });
    }
}
