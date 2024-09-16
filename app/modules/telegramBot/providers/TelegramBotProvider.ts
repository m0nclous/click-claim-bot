import { ApplicationService, LoggerService } from '@adonisjs/core/types';
import { RedisService } from '@adonisjs/redis/types';
import type { TelegramBotConfig, TelegramBotService } from '../services/TelegramBotService.js';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        telegramBot: TelegramBotService;
    }
}

export default class TelegramBotProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('telegramBot', async () => {
            const { TelegramBotService } = await import('../services/TelegramBotService.js');

            const config: TelegramBotConfig = this.app.config.get<TelegramBotConfig>('telegram-bot');
            const logger: LoggerService = await this.app.container.make('logger');
            const redis: RedisService = await this.app.container.make('redis');

            return new TelegramBotService(config, redis, logger);
        });
    }
}
