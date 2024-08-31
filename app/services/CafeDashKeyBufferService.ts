import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { CafeDashKeyGenerateService } from '#services/CafeDashKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class CafeDashKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    protected async getKeyGenerateService(): Promise<CafeDashKeyGenerateService> {
        return this.app.container.make('cafeDashKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'cafe-dash';
    }
}
