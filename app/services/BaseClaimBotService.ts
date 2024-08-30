import { BaseBotService } from '#services/BaseBotService';
import type BaseGameService from '#services/BaseGameService';
import type { HasClaim } from '#services/BaseGameService';
import emitter from '@adonisjs/core/services/emitter';
import UnauthenticatedException from '#exceptions/UnauthenticatedException';
import logger from '@adonisjs/core/services/logger';

export interface IClaimEvent {
    self: BaseGameService;
    userId: number;
}

export interface IClaimErrorEvent extends IClaimEvent {
    error: any;
}

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    interface EventsList {
        'bot:claim': IClaimEvent;
        'bot:claim:error': IClaimErrorEvent;
    }
}

export abstract class BaseClaimBotService extends BaseBotService {
    public getRedisSlug(): string {
        return 'claim';
    }

    public getGameService(runtimeValues: any[] = []): Promise<BaseGameService & HasClaim> {
        return this.app.container.make(this.getGameServiceName(), runtimeValues);
    }

    public async execute(userId: string): Promise<void> {
        try {
            const gameService: BaseGameService & HasClaim = await this.getGameService([userId]);

            await gameService.login();
            const canClaim = await gameService.canClaim();

            if (!canClaim) {
                return;
            }

            await gameService.claim();

            await emitter.emit<any>('bot:claim', {
                self: gameService,
                userId,
            });
        } catch (error) {
            if (error instanceof UnauthenticatedException) {
                await emitter.emit('bot:error:unauthenticated', {
                    userId: parseInt(userId),
                });
            } else {
                logger.error(error);

                await emitter.emit('bot:claim:error', {
                    self: await this.getGameService([userId]),
                    userId: parseInt(userId),
                    error,
                });
            }

            throw error;
        }
    }
}
