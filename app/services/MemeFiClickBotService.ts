import { BaseClickBotService } from '#services/BaseClickBotService';

export class MemeFiClickBotService extends BaseClickBotService {
    public getServiceSlug(): string {
        return 'memeFi';
    }

    public getGameServiceName(): string {
        return 'memeFiGameService';
    }

    protected getIntervalDelay(): number {
        return 60_000 * 5;
    }
}
