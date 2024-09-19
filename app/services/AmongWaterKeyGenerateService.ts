import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class AmongWaterKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Among Water';
    }

    protected getAppToken(): string {
        return 'daab8f83-8ea2-4ad0-8dd5-d33363129640';
    }

    protected getPromoId(): string {
        return 'daab8f83-8ea2-4ad0-8dd5-d33363129640';
    }
    protected getEventType(): string {
        return '';
    }
}
