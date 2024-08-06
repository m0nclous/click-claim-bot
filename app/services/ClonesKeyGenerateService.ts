import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class ClonesKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    protected getAppToken(): string {
        return '74ee0b5b-775e-4bee-974f-63e7f4d5bacb';
    }

    protected getPromoId(): string {
        return 'fe693b26-b342-4159-8808-15e3ff7f8767';
    }
    protected getEventType(): string {
        return 'MiniQuest';
    }
}
