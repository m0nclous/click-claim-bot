import { BaseBotService } from '#services/BaseBotService';
import BaseGameService, { HasDailyReward } from '#services/BaseGameService';

export abstract class BaseDailyBotService extends BaseBotService {
    protected abstract getIntervalDelay(): number;

    public getRedisSlug(): string {
        return 'daily';
    }

    public getGameService(runtimeValues: any[] = []): Promise<BaseGameService & HasDailyReward> {
        return this.app.container.make(this.getGameServiceName(), runtimeValues);
    }

    public async execute(userId: string): Promise<void> {
        const gameService: BaseGameService & HasDailyReward = await this.getGameService([userId]);

        await gameService.login();
        await gameService.collectDaily();
    }

    public async run(): Promise<NodeJS.Timeout> {
        return setInterval(async () => {
            const userIds: string[] = await this.getUsers();

            for (const userId of userIds) {
                this.execute(userId).then();
            }
        }, this.getIntervalDelay());
    }
}
