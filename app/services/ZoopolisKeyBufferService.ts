import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { ZoopolisKeyGenerateService } from '#services/ZoopolisKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class ZoopolisKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    protected async getKeyGenerateService(): Promise<ZoopolisKeyGenerateService> {
        return this.app.container.make('zoopolisKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'zoopolis';
    }
}
