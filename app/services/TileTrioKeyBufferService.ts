import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { TileTrioKeyGenerateService } from '#services/TileTrioKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class TileTrioKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<TileTrioKeyGenerateService> {
        return this.app.container.make('tileTrioKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'tile-trio';
    }
}
