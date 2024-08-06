import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class RiderKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    protected getAppToken(): string {
        return 'd28721be-fd2d-4b45-869e-9f253b554e50';
    }

    protected getPromoId(): string {
        return '43e35910-c168-4634-ad4f-52fd764a843f';
    }

    protected getEventType(): string {
        return '';
    }
}
