import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { MtkClickBotService } from '#services/MtkClickBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mtkClickBotService: MtkClickBotService;
    }
}

export default class MtkClickBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('mtkClickBotService', async () => {
            const { MtkClickBotService } = await import('#services/MtkClickBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new MtkClickBotService(this.app, redis);
        });
    }
}
