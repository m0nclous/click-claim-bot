import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { FactoryWorldKeyGenerateService } from '#services/FactoryWorldKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class FactoryWorldKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<FactoryWorldKeyGenerateService> {
        return this.app.container.make('factoryWorldKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'factory-world';
    }
}
