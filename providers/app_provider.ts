import type { ApplicationService, ContainerBindings, LoggerService } from '@adonisjs/core/types';
import type { TelegramBotService } from '#services/TelegramBotService';
import type { UserFromGetMe } from '@telegraf/types/manage.js';

type GameBotServiceBinding = keyof ContainerBindings;

export default class AppProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async boot(): Promise<void> {
        const logger: LoggerService = await this.app.container.make('logger');

        if (this.app.getEnvironment() === 'web') {
            const telegramBot: TelegramBotService = await this.app.container.make('telegramBot');
            telegramBot.run().then((botInfo: UserFromGetMe) => {
                logger.info({
                    event: 'TELEGRAM_BOT_START',
                    bot: {
                        ...botInfo,
                    },
                });
            });

            const gameBotServicesToRun: GameBotServiceBinding[] = [
                'mtkClickBotService',
                'mtkDailyBotService',
                'gemzClickBotService',
                'gemzDailyBotService',
                'memeFiClickBotService',
                'mine2MineClickBotService',
                'zavodClaimBotService',
                'toonClaimBotService',
            ];

            for (const gameBotServiceBinding of gameBotServicesToRun) {
                const service: ContainerBindings[keyof ContainerBindings] =
                    await this.app.container.make(gameBotServiceBinding);

                if (!('run' in service)) {
                    throw new Error('Run method is not implemented');
                }

                service.run().then(() => {
                    logger.info({
                        event: 'GAME_SERVICE_START',
                        service: {
                            name: service.constructor.name,
                        },
                    });
                });
            }
        }
    }
}
