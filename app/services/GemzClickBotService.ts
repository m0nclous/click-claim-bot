import { BaseClickBotService } from '#services/BaseClickBotService';

export class GemzClickBotService extends BaseClickBotService {
    public getServiceSlug(): string {
        return 'gemz';
    }

    public getGameServiceName(): string {
        return 'gemzGameService';
    }

    protected getIntervalDelay(): number {
        return 60_000 * 5;
    }
}
