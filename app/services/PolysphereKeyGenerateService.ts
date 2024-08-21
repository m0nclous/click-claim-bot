import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class PolysphereKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    public getAppName(): string {
        return 'Polysphere';
    }

    protected getAppToken(): string {
        return '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71';
    }

    protected getPromoId(): string {
        return '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71';
    }
    protected getEventType(): string {
        return 'test';
    }
}
