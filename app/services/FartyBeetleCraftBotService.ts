import { BaseBotService } from '#services/BaseBotService';
import emitter from '@adonisjs/core/services/emitter';
import logger from '@adonisjs/core/services/logger';
import FartyBeetleGameService, { IClockReward, IFactory } from '#services/FartyBeetleGameService';
import getRandomInt from '#helpers/getRandomInt';

export interface IFartyBeetleCraftEvent {
    self: FartyBeetleGameService;
    userId: number;
}

export interface IFartyBeetleCraftFinishEvent extends IFartyBeetleCraftEvent {
    factory: IFactory;
    task: IFactory['current_task'];
    rewards: IClockReward[];
}

export interface IFartyBeetleCraftErrorEvent extends IFartyBeetleCraftEvent {
    error: any;
}

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    interface EventsList {
        'bot:farty-beetle:craft:finish': IFartyBeetleCraftFinishEvent;
        'bot:farty-beetle:craft:error': IFartyBeetleCraftErrorEvent;
    }
}

export class FartyBeetleCraftBotService extends BaseBotService {
    public getRedisSlug(): string {
        return 'craft';
    }

    public getServiceSlug(): string {
        return 'farty-beetle';
    }

    public getGameServiceName(): string {
        return 'fartyBeetleGameService';
    }

    protected getIntervalDelay(): number {
        return 1_000 * 30;
    }

    public async execute(userId: string): Promise<void> {
        const gameService: FartyBeetleGameService = (await this.getGameService([
            userId,
        ])) as FartyBeetleGameService;

        try {
            await gameService.login();

            const bootData = await gameService.boot();

            if (bootData.done_factories.length >= 20) {
                logger.debug(bootData, 'Достигнут лимит в 20 произведённых жуков');
                return;
            }

            const factories = (await gameService.getFactories()).filter(
                (factory) => !bootData.done_factories.includes(factory.id),
            );

            if (factories.length === 0) {
                throw new Error('Нет доступных жуков для крафта');
            }

            const factory = factories[getRandomInt(0, factories.length - 1)];

            const rewards = await gameService.clock(factory.id, factory.current_task);

            if (rewards.length === 0) {
                logger.error(
                    {
                        bootData,
                        factory,
                    },
                    'Жук собран, но награды нет. Почему?',
                );

                return;
            }

            await emitter.emit('bot:farty-beetle:craft:finish', {
                self: gameService,
                userId: parseInt(userId),
                factory: factory,
                task: factory.current_task,
                rewards: rewards,
            });
        } catch (error) {
            logger.error(error);

            await emitter.emit('bot:farty-beetle:craft:error', {
                self: gameService,
                userId: parseInt(userId),
                error,
            });

            throw error;
        }
    }
}
