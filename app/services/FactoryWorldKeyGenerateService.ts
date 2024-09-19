import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class FactoryWorldKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Factory World';
    }

    protected getAppToken(): string {
        return 'd02fc404-8985-4305-87d8-32bd4e66bb16';
    }

    protected getPromoId(): string {
        return 'd02fc404-8985-4305-87d8-32bd4e66bb16';
    }
    protected getEventType(): string {
        return '';
    }
}
