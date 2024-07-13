import { BaseBotService } from '#services/BaseBotService';
import BaseGameService, { ReLoginError, TapError } from '#services/BaseGameService';
import type { HasTap } from '#services/BaseGameService';

export interface ITapEvent {
    self: BaseGameService;
    userId: number;
    quantity: number;
}

export interface ITapErrorEvent<T> extends ITapEvent {
    error: TapError<T>;
}

export interface IReLoginEvent {
    self: BaseGameService;
    userId: number;
}

export interface IReLoginErrorEvent<T> extends IReLoginEvent {
    error: ReLoginError<T>;
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
            .catch((error: Error | TapError<unknown> | ReLoginError<unknown>) => {
                if (error instanceof TapError || error instanceof ReLoginError) {
                    return;
                }

                throw error;
            });
    }
}
