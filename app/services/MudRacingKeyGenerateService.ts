import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class MudRacingKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    public getAppName(): string {
        return 'Mud Racing';
    }

    protected getAppToken(): string {
        return '8814a785-97fb-4177-9193-ca4180ff9da8';
    }

    protected getPromoId(): string {
        return '8814a785-97fb-4177-9193-ca4180ff9da8';
    }
    protected getEventType(): string {
        return 'test';
    }
}
