import { BaseClickBotService } from '#services/BaseClickBotService';

export class MtkClickBotService extends BaseClickBotService {
    public getServiceSlug(): string {
        return 'mtk';
    }

    public getGameServiceName(): string {
        return 'mtkGameService';
    }

    protected getIntervalDelay(): number {
        return 60_000 * 5;
    }
}
