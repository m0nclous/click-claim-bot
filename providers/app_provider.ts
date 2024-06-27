import type { TelegramClient } from 'telegram';
import { ApplicationService } from '@adonisjs/core/types';

export default class AppProvider {
    protected app: ApplicationService;

    constructor(app: ApplicationService) {
        this.app = app;
    }

    // noinspection JSUnusedGlobalSymbols
    public async boot() {
        const telegramClient: TelegramClient = await this.app.container.make('telegramClient');

        await telegramClient.connect();
    }
}
