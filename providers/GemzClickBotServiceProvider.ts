import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { GemzClickBotService } from '#services/GemzClickBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        gemzClickBotService: GemzClickBotService;
    }
}

export default class MtkClickBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('gemzClickBotService', async () => {
            const { GemzClickBotService } = await import('#services/GemzClickBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new GemzClickBotService(this.app, redis);
        });
    }
}
