import { ApplicationService } from '@adonisjs/core/types';
import { TelegramBotService } from '#services/TelegramBotService';
import { MtkClickBotService } from '#services/MtkClickBotService';
import { UserFromGetMe } from '@telegraf/types/manage.js';
import { MtkDailyBotService } from '#services/MtkDailyBotService';
import { GemzClickBotService } from '#services/GemzClickBotService';
import { GemzDailyBotService } from '#services/GemzDailyBotService';

export default class AppProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async boot(): Promise<void> {
        const logger = await this.app.container.make('logger');

        if (this.app.getEnvironment() === 'web') {
            const telegramBot: TelegramBotService = await this.app.container.make('telegramBot');
            telegramBot.run().then((botInfo: UserFromGetMe | undefined) => {
                if (!botInfo) {
                    throw new Error('Bot not found!');
                }

                logger.info(botInfo, 'Чат-Бот успешно запущен');
            });

            const mtkClickBotService: MtkClickBotService =
                await this.app.container.make('mtkClickBotService');

            const gemzClickBotService: GemzClickBotService =
                await this.app.container.make('gemzClickBotService');

            const mtkDailyBotService: MtkDailyBotService =
                await this.app.container.make('mtkDailyBotService');

            const gemzDailyBotService: GemzDailyBotService =
                await this.app.container.make('gemzDailyBotService');

            mtkClickBotService.run().then(() => {
                logger.info('Mtk Click Bot Service started');
            }).catch((err: Error) => {
                logger.error(err);
            });

            gemzClickBotService.run().then(() => {
                logger.info('Gemz Click Bot Service started');
            }).catch((err: Error) => {
                logger.error(err);
            });

            mtkDailyBotService.run().then(() => {
                logger.info('Mtk Daily Bot Service started');
            }).catch((err: Error) => {
                logger.error(err);
            });

            gemzDailyBotService.run().then(() => {
                logger.info('Gemz Daily Bot Service started');
            }).catch((err: Error) => {
                logger.error(err);
            });
        }
    }
}
