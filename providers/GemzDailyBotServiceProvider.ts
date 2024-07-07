import { ApplicationService } from '@adonisjs/core/types';
import { RedisService } from '@adonisjs/redis/types';
import { GemzDailyBotService } from '#services/GemzDailyBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        gemzDailyBotService: GemzDailyBotService;
    }
}

export default class GemzDailyBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('gemzDailyBotService', async () => {
            const { GemzDailyBotService } = await import('#services/GemzDailyBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new GemzDailyBotService(this.app, redis);
        });
    }
}
