import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class TwerkKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Twerk';
    }

    protected getAppToken(): string {
        return '61308365-9d16-4040-8bb0-2f4a4c69074c';
    }

    protected getPromoId(): string {
        return '61308365-9d16-4040-8bb0-2f4a4c69074c';
    }
    protected getEventType(): string {
        return 'StartLevel';
    }
}
