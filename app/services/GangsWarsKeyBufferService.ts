import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { GangsWarsKeyGenerateService } from '#services/GangsWarsKeyGenerateService';
import BaseKeyBufferService from '#services/BaseKeyBufferService';

export class GangsWarsKeyBufferService extends BaseKeyBufferService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {
        super(app, redis);
    }

    protected async getKeyGenerateService(): Promise<GangsWarsKeyGenerateService> {
        return this.app.container.make('gangsWarsKeyGenerate');
    }

    protected getRedisSlug(): string {
        return 'gangs-wars';
    }
}
