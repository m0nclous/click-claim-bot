import { BaseClickBotService } from '#services/BaseClickBotService';

export class CityHoldersClickBotService extends BaseClickBotService {
    public getServiceSlug(): string {
        return 'city-holders';
    }

    public getGameServiceName(): string {
        return 'cityHoldersGameService';
    }

    protected getIntervalDelay(): number {
        return 60_000 * 5;
    }
}
