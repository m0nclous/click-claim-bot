import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import { FartyBeetleCraftBotService } from '#services/FartyBeetleCraftBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        fartyBeetleCraftBotService: FartyBeetleCraftBotService;
    }
}

export default class ZavodClaimBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('fartyBeetleCraftBotService', async () => {
            const { FartyBeetleCraftBotService } = await import('#services/FartyBeetleCraftBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new FartyBeetleCraftBotService(this.app, redis);
        });
    }
}
