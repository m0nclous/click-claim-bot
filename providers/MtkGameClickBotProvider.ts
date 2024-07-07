import { ApplicationService } from '@adonisjs/core/types';
import type { MtkGameClickBotService } from '#services/MtkGameClickBotService';
import { RedisService } from '@adonisjs/redis/types';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mtkGameClickBotService: MtkGameClickBotService;
    }
}

export default class MtkGameClickBotProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('mtkGameClickBotService', async () => {
            const { MtkGameClickBotService } = await import('#services/MtkGameClickBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new MtkGameClickBotService(redis);
        });
    }
}
