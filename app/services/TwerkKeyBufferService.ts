import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { TwerkKeyGenerateService } from '#services/TwerkKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class TwerkKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    protected async getKeyGenerateService(): Promise<TwerkKeyGenerateService> {
        return this.app.container.make('twerkKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'twerk-race';
    }
}
