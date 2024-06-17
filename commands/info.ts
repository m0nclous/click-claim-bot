import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import telegramApiConfig from '#config/telegram-api';

export default class Info extends BaseCommand {
    static commandName = 'info';
    static description = 'Показать текущую информацию';

    static options: CommandOptions = {};

    async run() {
        this.logger.info('Telegram API ID: ' + telegramApiConfig.id);
        this.logger.info('Telegram API Hash: ' + telegramApiConfig.hash);
        this.logger.info('Telegram API Session IP: ' + telegramApiConfig.session.serverAddress);
    }
}
