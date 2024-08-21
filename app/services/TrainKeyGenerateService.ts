import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class TrainKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    public getAppName(): string {
        return 'Train Miner';
    }

    protected getAppToken(): string {
        return '82647f43-3f87-402d-88dd-09a90025313f';
    }

    protected getPromoId(): string {
        return 'c4480ac7-e178-4973-8061-9ed5b2e17954';
    }

    protected getEventType(): string {
        return 'hitStatue';
    }
}
