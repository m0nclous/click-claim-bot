import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class CafeDashKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    public getAppName(): string {
        return 'Cafe Dash';
    }

    protected getAppToken(): string {
        return 'bc0971b8-04df-4e72-8a3e-ec4dc663cd11';
    }

    protected getPromoId(): string {
        return 'bc0971b8-04df-4e72-8a3e-ec4dc663cd11';
    }
    protected getEventType(): string {
        return '';
    }
}
