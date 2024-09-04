import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { FluffCrusadeKeyGenerateService } from '#services/FluffCrusadeKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class FluffCrusadeKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    public async getKeyGenerateService(): Promise<FluffCrusadeKeyGenerateService> {
        return this.app.container.make('fluffCrusadeKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'fluff-crusade';
    }
}
