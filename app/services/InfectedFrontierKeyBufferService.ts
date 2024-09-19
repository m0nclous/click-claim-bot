import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { InfectedFrontierKeyGenerateService } from '#services/InfectedFrontierKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class InfectedFrontierKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<InfectedFrontierKeyGenerateService> {
        return this.app.container.make('infectedFrontierKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'infected-frontier';
    }
}
