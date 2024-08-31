import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class MowAndTrimKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Mow and Trim';
    }

    protected getAppToken(): string {
        return 'ef319a80-949a-492e-8ee0-424fb5fc20a6';
    }

    protected getPromoId(): string {
        return 'ef319a80-949a-492e-8ee0-424fb5fc20a6';
    }
    protected getEventType(): string {
        return 'test';
    }
}
