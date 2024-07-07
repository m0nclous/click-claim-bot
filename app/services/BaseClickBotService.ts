import { BaseBotService } from '#services/BaseBotService';
import BaseGameService, { HasTap } from '#services/BaseGameService';
import logger from '@adonisjs/core/services/logger';

export abstract class BaseClickBotService extends BaseBotService {
    public abstract getTapQuantity(): Promise<number>;

    public getRedisSlug(): string {
        return 'click';
    }

    public getGameService(runtimeValues: any[] = []): Promise<BaseGameService & HasTap> {
        return this.app.container.make(this.getGameServiceName(), runtimeValues);
    }

    public async execute(userId: string): Promise<void> {
        const gameService: BaseGameService & HasTap = await this.getGameService([userId]);

        const tapQuantity: number = await this.getTapQuantity();

        await gameService.login();
        await gameService.tap(tapQuantity).catch((error: Error) => {
            logger.error(error);
        });
    }
}
