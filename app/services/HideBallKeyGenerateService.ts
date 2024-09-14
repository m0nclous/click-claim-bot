import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class HideBallKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Hide Ball';
    }

    protected getAppToken(): string {
        return '4bf4966c-4d22-439b-8ff2-dc5ebca1a600';
    }

    protected getPromoId(): string {
        return '4bf4966c-4d22-439b-8ff2-dc5ebca1a600';
    }

    protected getEventType(): string {
        return '';
    }
}
