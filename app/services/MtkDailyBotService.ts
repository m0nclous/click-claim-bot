import { BaseDailyBotService } from '#services/BaseDailyBotService';

export class MtkDailyBotService extends BaseDailyBotService {
    public getServiceSlug(): string {
        return 'mtk';
    }

    public getGameServiceName(): string {
        return 'mtkGameService';
    }

    protected getIntervalDelay(): number {
        return 1_000 * 60 * 60;
    }
}
