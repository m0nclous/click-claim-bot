import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import telegramConfig from '#config/telegram';

export default class Info extends BaseCommand {
    static commandName = 'info';
    static description = 'Показать текущую информацию';

    static options: CommandOptions = {};

    async run() {
        this.logger.info('Telegram API ID: ' + telegramConfig.api.id);
        this.logger.info('Telegram API Hash: ' + telegramConfig.api.hash);
        this.logger.info('Telegram API Session IP: ' + telegramConfig.api.session.serverAddress);
    }
}
