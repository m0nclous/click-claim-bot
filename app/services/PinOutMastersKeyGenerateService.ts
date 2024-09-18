import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class PinOutMastersKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Pin Out Masters';
    }

    protected getAppToken(): string {
        return 'd2378baf-d617-417a-9d99-d685824335f0';
    }

    protected getPromoId(): string {
        return 'd2378baf-d617-417a-9d99-d685824335f0';
    }

    protected getEventType(): string {
        return '';
    }
}
