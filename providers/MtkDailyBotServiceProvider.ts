import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { MtkDailyBotService } from '#services/MtkDailyBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mtkDailyBotService: MtkDailyBotService;
    }
}

export default class MtkClickBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('mtkDailyBotService', async () => {
            const { MtkDailyBotService } = await import('#services/MtkDailyBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new MtkDailyBotService(this.app, redis);
        });
    }
}
