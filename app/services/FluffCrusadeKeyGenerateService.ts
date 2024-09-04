import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class FluffCrusadeKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Fluff Crusade';
    }

    protected getAppToken(): string {
        return '112887b0-a8af-4eb2-ac63-d82df78283d9';
    }

    protected getPromoId(): string {
        return '112887b0-a8af-4eb2-ac63-d82df78283d9';
    }

    protected getEventType(): string {
        return '';
    }
}
