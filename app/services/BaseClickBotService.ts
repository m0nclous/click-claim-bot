import { BaseBotService } from '#services/BaseBotService';
import type BaseGameService from '#services/BaseGameService';
import { SessionExpiredError, TapError } from '#services/BaseGameService';
import type { HasTap } from '#services/BaseGameService';
import { sleep } from '#helpers/timer';
import emitter from '@adonisjs/core/services/emitter';

export interface ITapEvent {
    self: BaseGameService;
    userId: number;
    quantity: number;
}

export interface ITapErrorEvent<T> extends ITapEvent {
    error: TapError<T>;
}

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    interface EventsList {
        'bot:tap': ITapEvent;
        'bot:tap:error': ITapErrorEvent<any>;
    }
}

export interface ISessionExpiredEvent {
    self: BaseGameService;
    userId: number;
}

export interface ISessionExpiredErrorEvent<T> extends ISessionExpiredEvent {
    error: SessionExpiredError<T>;
}

export abstract class BaseClickBotService extends BaseBotService {
    public getRedisSlug(): string {
        return 'click';
    }

    public getGameService(runtimeValues: any[] = []): Promise<BaseGameService & HasTap> {
        return this.app.container.make(this.getGameServiceName(), runtimeValues);
    }

    public async execute(userId: string): Promise<void> {
        try {
            const gameService: BaseGameService & HasTap = await this.getGameService([userId]);

            await gameService.login();
            await sleep(2_000);

            const tapQuantity: number = await gameService.getTapQuantity();

            if (tapQuantity === 0) {
                return;
            }

            await sleep(2_000);
            await gameService
                .tap(tapQuantity)
                .catch((error: Error | TapError<unknown> | SessionExpiredError<unknown>) => {
                    if (error instanceof TapError || error instanceof SessionExpiredError) {
                        return;
                    }

                    throw error;
                });
        } catch (error) {
            await emitter.emit('bot:tap:error', {
                self: await this.getGameService([userId]),
                userId: parseInt(userId),
                error,
                quantity: 0,
            });

            throw error;
        }
    }
}
