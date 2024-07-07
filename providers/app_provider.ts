import { ApplicationService } from '@adonisjs/core/types';
import { TelegramBotService } from '#services/TelegramBotService';
import type { MtkGameClickBotService } from '#services/MtkGameClickBotService';

export default class AppProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async boot(): Promise<void> {
        if (this.app.getEnvironment() === 'web') {
            const telegramBot: TelegramBotService = await this.app.container.make('telegramBot');
            telegramBot.run().then();

            const mtkGameClickBotService: MtkGameClickBotService = await this.app.container.make('mtkGameClickBotService');
            mtkGameClickBotService.run();
        }
    }
}
