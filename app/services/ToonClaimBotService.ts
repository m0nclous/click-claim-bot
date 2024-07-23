import { BaseClaimBotService } from '#services/BaseClaimBotService';

export class ToonClaimBotService extends BaseClaimBotService {
    public getServiceSlug(): string {
        return 'toon';
    }

    public getGameServiceName(): string {
        return 'toonGameService';
    }

    protected getIntervalDelay(): number {
        return 1_000 * 60 * 10;
    }
}
