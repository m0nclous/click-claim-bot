import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import { Mine2MineClickBotService } from '#services/Mine2MineClickBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mine2MineClickBotService: Mine2MineClickBotService;
    }
}

export default class Mine2MineClickBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('mine2MineClickBotService', async () => {
            const { Mine2MineClickBotService } = await import('#services/Mine2MineClickBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new Mine2MineClickBotService(this.app, redis);
        });
    }
}
