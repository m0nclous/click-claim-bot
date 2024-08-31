import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { PolysphereKeyGenerateService } from '#services/PolysphereKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class PolysphereKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<PolysphereKeyGenerateService> {
        return this.app.container.make('polysphereKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'polysphere';
    }
}
