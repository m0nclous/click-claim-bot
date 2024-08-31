import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class PolysphereKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Polysphere';
    }

    protected getAppToken(): string {
        return '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71';
    }

    protected getPromoId(): string {
        return '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71';
    }
    protected getEventType(): string {
        return 'test';
    }
}
