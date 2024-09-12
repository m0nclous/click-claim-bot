import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class BouncemastersKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Bouncemasters';
    }

    protected getAppToken(): string {
        return 'bc72d3b9-8e91-4884-9c33-f72482f0db37';
    }

    protected getPromoId(): string {
        return 'bc72d3b9-8e91-4884-9c33-f72482f0db37';
    }

    protected getEventType(): string {
        return '';
    }
}
