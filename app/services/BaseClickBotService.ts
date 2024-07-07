import { BaseBotService } from '#services/BaseBotService';
import BaseGameService, { HasTap } from '#services/BaseGameService';

export abstract class BaseClickBotService extends BaseBotService {
    protected abstract getIntervalDelay(): number;

    public abstract getTapQuantity(): Promise<number>;

    public getRedisSlug(): string {
        return 'click';
    }

    public getGameService(runtimeValues: any[] = []): Promise<BaseGameService & HasTap> {
        return this.app.container.make(this.getGameServiceName(), runtimeValues);
    }

    public async execute(userId: string): Promise<void> {
        const gameClickService: BaseGameService & HasTap = await this.getGameService([userId]);

        const tapQuantity: number = await this.getTapQuantity();

        await gameClickService.login();
        await gameClickService.tap(tapQuantity);
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
