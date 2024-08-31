import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class GangsWarsKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Gangs Wars';
    }

    protected getAppToken(): string {
        return 'b6de60a0-e030-48bb-a551-548372493523';
    }

    protected getPromoId(): string {
        return 'c7821fa7-6632-482c-9635-2bd5798585f9';
    }
    protected getEventType(): string {
        return '';
    }
}
