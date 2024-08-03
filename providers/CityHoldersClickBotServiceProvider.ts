import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import { CityHoldersClickBotService } from '#services/CityHoldersClickBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        cityHoldersClickBotService: CityHoldersClickBotService;
    }
}

export default class CityHoldersClickBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('cityHoldersClickBotService', async () => {
            const { CityHoldersClickBotService } = await import('#services/CityHoldersClickBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new CityHoldersClickBotService(this.app, redis);
        });
    }
}
