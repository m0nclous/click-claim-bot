import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class ZoopolisKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    public getAppName(): string {
        return 'Zoopolis';
    }

    protected getAppToken(): string {
        return 'b2436c89-e0aa-4aed-8046-9b0515e1c46b';
    }

    protected getPromoId(): string {
        return 'b2436c89-e0aa-4aed-8046-9b0515e1c46b';
    }
    protected getEventType(): string {
        return '';
    }
}
