import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import { TimeFarmClaimBotService } from '#services/TimeFarmClaimBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        timeFarmClaimBotService: TimeFarmClaimBotService;
    }
}

export default class TimeFarmClaimBotServiceProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.singleton('timeFarmClaimBotService', async () => {
            const { TimeFarmClaimBotService } = await import('#services/TimeFarmClaimBotService');
            const redis: RedisService = await this.app.container.make('redis');

            return new TimeFarmClaimBotService(this.app, redis);
        });
    }
}
