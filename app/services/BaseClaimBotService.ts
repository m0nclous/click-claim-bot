import { BaseBotService } from '#services/BaseBotService';
import BaseGameService, { ClaimError, HasClaim } from '#services/BaseGameService';

export abstract class BaseClaimBotService extends BaseBotService {
    public getRedisSlug(): string {
        return 'claim';
    }

    public getGameService(runtimeValues: any[] = []): Promise<BaseGameService & HasClaim> {
        return this.app.container.make(this.getGameServiceName(), runtimeValues);
    }

    public async execute(userId: string): Promise<void> {
        const gameService: BaseGameService & HasClaim = await this.getGameService([userId]);

        await gameService.login();
        const canClaim = await gameService.canClaim();

        if (canClaim) {
            await gameService.claim().catch((error: Error | ClaimError<unknown>) => {
                if (error instanceof ClaimError) {
                    return;
                }

                throw error;
            });
        }
    }
}
