import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class CubeKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
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
