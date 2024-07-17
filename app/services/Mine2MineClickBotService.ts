import { BaseClickBotService } from '#services/BaseClickBotService';

export class Mine2MineClickBotService extends BaseClickBotService {
    public getServiceSlug(): string {
        return 'mine2mine';
    }

    public getGameServiceName(): string {
        return 'mine2MineGameService';
    }

    protected getIntervalDelay(): number {
        return 60_000 * 5;
    }
}
