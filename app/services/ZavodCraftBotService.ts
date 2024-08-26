import { BaseBotService } from '#services/BaseBotService';
import emitter from '@adonisjs/core/services/emitter';
import ZavodGameService, { ICraftGame, ICraftGameFinish } from '#services/ZavodGameService';
import { sleep } from '#helpers/timer';
import { randomInt } from 'crypto';

export interface IZavodCraftEvent {
    self: ZavodGameService;
    userId: number;
}

export interface IZavodCraftErrorEvent extends IZavodCraftEvent {
    error: any;
}

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    interface EventsList {
        'bot:zavod:craft:finish': IZavodCraftEvent;
        'bot:zavod:craft:error': IZavodCraftErrorEvent;
    }
}

export class ZavodCraftBotService extends BaseBotService {
    public getRedisSlug(): string {
        return 'craft';
    }

    public getServiceSlug(): string {
        return 'zavod';
    }

    public getGameServiceName(): string {
        return 'zavodGameService';
    }

    protected getIntervalDelay(): number {
        return 1_000 * 60 * 5;
    }

    public async execute(userId: string): Promise<void> {
        const gameService: ZavodGameService = (await this.getGameService([userId])) as ZavodGameService;

        try {
            await gameService.login();
            const canStartCraftGame = await gameService.canStartCraftGame();

            if (!canStartCraftGame) {
                return;
            }

            let craftGame: ICraftGame = await gameService.getCraftGame();

            let stop = false;
            while (!stop) {
                const selectedCells: ICraftGameFinish['selectedSells'] = [];
                const craftGameBoard: ICraftGame['board'] = gameService.makeCraftGameBoard(
                    craftGame.board,
                    craftGame.seed,
                );

                // С шансом 1 к 5 собираем брак
                stop = randomInt(1, 6) === 1;

                // Если уровень достиг 10, то принудительно завершаем игру
                if (!stop && craftGame.level >= 10) {
                    stop = true;
                }

                for (const i in craftGameBoard) {
                    // Пропускаем TRASH предметы
                    if (craftGameBoard[i] === 1) {
                        continue;
                    }

                    selectedCells.push(parseInt(i));

                    // Завершаем поиск предметов, если уже нашли 3 штуки
                    if (selectedCells.length === 3) {
                        break;
                    }
                }

                if (stop) {
                    selectedCells[2] = craftGameBoard.findIndex((cell) => cell === 1);
                }

                await sleep(1_000);
                craftGame = await gameService.finishCraftGame('SAVE', selectedCells);

                await emitter.emit<any>('bot:zavod:craft:finish', {
                    self: gameService,
                    userId,
                });
            }
        } catch (error) {
            await emitter.emit('bot:zavod:craft:error', {
                self: gameService,
                userId: parseInt(userId),
                error,
            });

            throw error;
        }
    }
}
