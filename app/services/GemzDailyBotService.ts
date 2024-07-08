import { BaseDailyBotService } from '#services/BaseDailyBotService';

export class GemzDailyBotService extends BaseDailyBotService {
    public getServiceSlug(): string {
        return 'gemz';
    }

    public getGameServiceName(): string {
        return 'gemzGameService';
    }

    protected getIntervalDelay(): number {
        return 1_000 * 60 * 60;
    }
}
