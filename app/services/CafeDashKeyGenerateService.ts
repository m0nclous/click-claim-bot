import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class CafeDashKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Cafe Dash';
    }

    protected getAppToken(): string {
        return 'bc0971b8-04df-4e72-8a3e-ec4dc663cd11';
    }

    protected getPromoId(): string {
        return 'bc0971b8-04df-4e72-8a3e-ec4dc663cd11';
    }
    protected getEventType(): string {
        return '';
    }
}
