import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { MergeKeyGenerateService } from '#services/MergeKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class MergeKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    protected async getKeyGenerateService(): Promise<MergeKeyGenerateService> {
        return this.app.container.make('mergeKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'merge-away';
    }
}
