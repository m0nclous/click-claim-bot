import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { MemeFiClickBotService } from '#services/MemeFiClickBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        memeFiClickBotService: MemeFiClickBotService;
    }
}

export default class MemeFiClickBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('memeFiClickBotService', async () => {
            const { MemeFiClickBotService } = await import('#services/MemeFiClickBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new MemeFiClickBotService(this.app, redis);
        });
    }
}
