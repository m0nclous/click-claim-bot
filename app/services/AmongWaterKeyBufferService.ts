import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { AmongWaterKeyGenerateService } from '#services/AmongWaterKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class AmongWaterKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<AmongWaterKeyGenerateService> {
        return this.app.container.make('amongWaterKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'among-water';
    }
}
