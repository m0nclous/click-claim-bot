import { ApplicationService } from '@adonisjs/core/types';
import { TelegramService } from '#services/TelegramService';

export default class AppProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async boot(): Promise<void> {
        const telegram: TelegramService = await this.app.container.make('telegram');

        await (await telegram.getClient()).connect();
    }
}
