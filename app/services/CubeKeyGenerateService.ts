import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';

export class CubeKeyGenerateService extends BaseKeyGenerateService {
    public constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
    ) {
        super(app, logger);
    }

    public getAppName(): string {
        return 'Chain Cube';
    }

    protected getAppToken(): string {
        return 'd1690a07-3780-4068-810f-9b5bbf2931b2';
    }

    protected getPromoId(): string {
        return 'b4170868-cef0-424f-8eb9-be0622e8e8e3';
    }
    protected getEventType(): string {
        return 'cube_sent';
    }
}
