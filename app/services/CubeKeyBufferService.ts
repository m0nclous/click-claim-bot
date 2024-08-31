import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { CubeKeyGenerateService } from '#services/CubeKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class CubeKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    protected async getKeyGenerateService(): Promise<CubeKeyGenerateService> {
        return this.app.container.make('cubeKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'chain-cube';
    }
}
