import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class MergeKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Merge Away';
    }

    protected getAppToken(): string {
        return '8d1cc2ad-e097-4b86-90ef-7a27e19fb833';
    }

    protected getPromoId(): string {
        return 'dc128d28-c45b-411c-98ff-ac7726fbaea4';
    }
    protected getEventType(): string {
        return 'spend-energy';
    }
}
