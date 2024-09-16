import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { HideBallKeyGenerateService } from '#services/HideBallKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class HideBallKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<HideBallKeyGenerateService> {
        return this.app.container.make('hideBallKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'hide-ball';
    }
}
