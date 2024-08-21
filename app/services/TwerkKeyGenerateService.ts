import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class TwerkKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
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
