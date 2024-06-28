import { ApplicationService, LoggerService } from '@adonisjs/core/types';
import { TelegramConfig, TelegramService } from '#services/TelegramService';
import { RedisService } from '@adonisjs/redis/types';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        telegram: TelegramService;
    }
}

export default class TelegramProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('telegram', async () => {
            const { TelegramService } = await import('#services/TelegramService');

            const config: TelegramConfig = this.app.config.get<TelegramConfig>('telegram');
            const logger: LoggerService = await this.app.container.make('logger');
            const redis: RedisService = await this.app.container.make('redis');

            return new TelegramService(config, redis, logger);
        });
    }
}
