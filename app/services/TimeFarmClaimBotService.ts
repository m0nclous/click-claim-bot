import { BaseClaimBotService } from '#services/BaseClaimBotService';

export class TimeFarmClaimBotService extends BaseClaimBotService {
    public getServiceSlug(): string {
        return 'time-farm';
    }

    public getGameServiceName(): string {
        return 'timeFarmGameService';
    }

    protected getIntervalDelay(): number {
        return 1_000 * 60 * 10;
    }
}
