import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import { ToonClaimBotService } from '#services/ToonClaimBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        toonClaimBotService: ToonClaimBotService;
    }
}

export default class ToonClaimBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('toonClaimBotService', async () => {
            const { ToonClaimBotService } = await import('#services/ToonClaimBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new ToonClaimBotService(this.app, redis);
        });
    }
}
