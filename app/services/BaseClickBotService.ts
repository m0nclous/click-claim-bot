import { BaseBotService } from '#services/BaseBotService';
import BaseGameService, { SessionExpiredError, TapError } from '#services/BaseGameService';
import type { HasTap } from '#services/BaseGameService';

export interface ITapEvent {
    self: BaseGameService;
    userId: number;
    quantity: number;
}

export interface ITapErrorEvent<T> extends ITapEvent {
    error: TapError<T>;
}

export interface ISessionExpiredEvent {
    self: BaseGameService;
    userId: number;
}

export interface ISessionExpiredErrorEvent<T> extends ISessionExpiredEvent {
    error: SessionExpiredError<T>;
}

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
        await gameService
            .tap(tapQuantity)
            .catch((error: Error | TapError<unknown> | SessionExpiredError<unknown>) => {
                if (error instanceof TapError || error instanceof SessionExpiredError) {
                    return;
                }

                throw error;
            });
    }
}
