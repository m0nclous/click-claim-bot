import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class CountMastersKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Count Masters';
    }

    protected getAppToken(): string {
        return '4bdc17da-2601-449b-948e-f8c7bd376553';
    }

    protected getPromoId(): string {
        return '4bdc17da-2601-449b-948e-f8c7bd376553';
    }

    protected getEventType(): string {
        return '';
    }
}
