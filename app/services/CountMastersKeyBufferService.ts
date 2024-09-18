import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { CountMastersKeyGenerateService } from '#services/CountMastersKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class CountMastersKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<CountMastersKeyGenerateService> {
        return this.app.container.make('countMastersKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'count-masters';
    }
}
