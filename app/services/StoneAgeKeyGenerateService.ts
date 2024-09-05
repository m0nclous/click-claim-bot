import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class StoneAgeKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Stone Age';
    }

    protected getAppToken(): string {
        return '04ebd6de-69b7-43d1-9c4b-04a6ca3305af';
    }

    protected getPromoId(): string {
        return '04ebd6de-69b7-43d1-9c4b-04a6ca3305af';
    }
    protected getEventType(): string {
        return '';
    }
}
