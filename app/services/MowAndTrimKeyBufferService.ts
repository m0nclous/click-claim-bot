import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { MowAndTrimKeyGenerateService } from '#services/MowAndTrimKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class MowAndTrimKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    protected async getKeyGenerateService(): Promise<MowAndTrimKeyGenerateService> {
        return this.app.container.make('mowAndTrimKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'mow-and-trim';
    }
}
