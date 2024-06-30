import { ApplicationService } from '@adonisjs/core/types';
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
        this.app.container.bind('telegram', async (resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const { TelegramService } = await import('#services/TelegramService');

            const userId = runtimeValues[0];
            const config: TelegramConfig = this.app.config.get<TelegramConfig>('telegram');
            const redis: RedisService = await resolver.make('redis');

            return new TelegramService(userId, config, redis);
        });
    }
}
