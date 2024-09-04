import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class TileTrioKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Tile Trio';
    }

    protected getAppToken(): string {
        return 'e68b39d2-4880-4a31-b3aa-0393e7df10c7';
    }

    protected getPromoId(): string {
        return 'e68b39d2-4880-4a31-b3aa-0393e7df10c7';
    }
    protected getEventType(): string {
        return '';
    }
}
