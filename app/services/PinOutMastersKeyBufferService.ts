import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { PinOutMastersKeyGenerateService } from '#services/PinOutMastersKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class PinOutMastersKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<PinOutMastersKeyGenerateService> {
        return this.app.container.make('pinOutMastersKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'pin-out-masters';
    }
}
