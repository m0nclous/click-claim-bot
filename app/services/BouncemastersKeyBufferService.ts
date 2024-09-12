import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { BouncemastersKeyGenerateService } from '#services/BouncemastersKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class BouncemastersKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<BouncemastersKeyGenerateService> {
        return this.app.container.make('bouncemastersKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'bouncemasters';
    }
}
