import { ZavodClaimBotService } from '#services/ZavodClaimBotService';
import { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        zavodClaimBotService: ZavodClaimBotService;
    }
}

export default class ZavodClaimBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('zavodClaimBotService', async () => {
            const { ZavodClaimBotService } = await import('#services/ZavodClaimBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new ZavodClaimBotService(this.app, redis);
        });
    }
}
