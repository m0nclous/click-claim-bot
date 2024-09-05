import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { StoneAgeKeyGenerateService } from '#services/StoneAgeKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class StoneAgeKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<StoneAgeKeyGenerateService> {
        return this.app.container.make('stoneAgeKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'stone-age';
    }
}
