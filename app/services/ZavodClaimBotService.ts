import ZavodGameService from '#services/ZavodGameService';
import { BaseClaimBotService } from '#services/BaseClaimBotService';

export class ZavodClaimBotService extends BaseClaimBotService {
    public getServiceSlug(): string {
        return 'zavod';
    }

    public getGameServiceName(): string {
        return 'zavodGameService';
    }

    public async execute(userId: string): Promise<void> {
        const service: ZavodGameService = await this.app.container.make(this.getGameServiceName(), [userId]);

        await service.login();

        const { lastClaim, claimInterval } = service.farm;
        service.profile.serverTime;

        const canClaim = this.canClaim(
            new Date(lastClaim).getTime(),
            claimInterval,
            this.serverDeltaTime(service.profile.serverTime),
        );

        canClaim && (await service.claim());
    }

    private serverDeltaTime(serverTime: string) {
        return new Date().getTime() - new Date(serverTime ?? 0).getTime();
    }

    private syncedTimeNow(delta: number) {
        if (!delta) {
            return new Date();
        }
        return new Date(Date.now() - delta);
    }

    private canClaim(claimTime: number, claimInterval: number, serverTimeDelta = 0) {
        const now = this.syncedTimeNow(serverTimeDelta)?.getTime();
        const difference = claimTime + claimInterval - now; // Difference in milliseconds

        return difference <= 0;
    }

    protected getIntervalDelay(): number {
        return 3_600;
    }
}
