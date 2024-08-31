import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { TrainKeyGenerateService } from '#services/TrainKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class TrainKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<TrainKeyGenerateService> {
        return this.app.container.make('trainKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'train';
    }
}
