import { BaseClaimBotService } from '#services/BaseClaimBotService';

export class ZavodClaimBotService extends BaseClaimBotService {
    public getServiceSlug(): string {
        return 'zavod';
    }

    public getGameServiceName(): string {
        return 'zavodGameService';
    }

    protected getIntervalDelay(): number {
        return 1_000 * 60 * 10;
    }
}
