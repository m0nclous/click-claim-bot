import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class MowAndTrimKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    public getAppName(): string {
        return 'Mow and Trim';
    }

    protected getAppToken(): string {
        return 'ef319a80-949a-492e-8ee0-424fb5fc20a6';
    }

    protected getPromoId(): string {
        return 'ef319a80-949a-492e-8ee0-424fb5fc20a6';
    }
    protected getEventType(): string {
        return 'test';
    }
}
