import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class InfectedFrontierKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Infected Frontier';
    }

    protected getAppToken(): string {
        return 'eb518c4b-e448-4065-9d33-06f3039f0fcb';
    }

    protected getPromoId(): string {
        return 'eb518c4b-e448-4065-9d33-06f3039f0fcb';
    }
    protected getEventType(): string {
        return '';
    }
}
