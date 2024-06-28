import { ApplicationService } from '@adonisjs/core/types';
import { TelegramService } from '#services/TelegramService';
import { TelegramClient } from 'telegram';
import { TelegramBotService } from '#services/TelegramBotService';

export default class AppProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async boot(): Promise<void> {
        // Телеграм клиент
        const telegram: TelegramService = await this.app.container.make('telegram');
        const telegramClient: TelegramClient = await telegram.getClient();
        await telegramClient.connect();

        // Телеграм бот
        const telegramBot: TelegramBotService = await this.app.container.make('telegramBot');

        if (this.app.getEnvironment() === 'web') {
            await telegramBot.run();
        }
    }
}
