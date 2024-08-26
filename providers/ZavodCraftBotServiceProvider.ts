import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import { ZavodCraftBotService } from '#services/ZavodCraftBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        zavodCraftBotService: ZavodCraftBotService;
    }
}

export default class ZavodClaimBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('zavodCraftBotService', async () => {
            const { ZavodCraftBotService } = await import('#services/ZavodCraftBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new ZavodCraftBotService(this.app, redis);
        });
    }
}
