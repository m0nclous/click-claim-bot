import { BaseBotService } from '#services/BaseBotService';

export abstract class BaseClaimBotService extends BaseBotService {
    public getRedisSlug(): string {
        return 'claim';
    }
}
