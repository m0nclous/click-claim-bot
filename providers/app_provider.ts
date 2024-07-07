import { ApplicationService } from '@adonisjs/core/types';
import { TelegramBotService } from '#services/TelegramBotService';
import { MtkClickBotService } from '#services/MtkClickBotService';
import { UserFromGetMe } from '@telegraf/types/manage.js';

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

            const mtkClickBotService: MtkClickBotService = await this.app.container.make('mtkClickBotService');
            mtkClickBotService.run().then(() => {
                logger.info('Mtk Click Bot Service started');
            });
        }
    }
}
