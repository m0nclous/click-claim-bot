import { BaseCommand, flags } from '@adonisjs/core/ace';
import telegram from '#config/telegram';

export default class BaseCommandExtended extends BaseCommand {
    @flags.boolean({
        description: 'Отправить уведомление в Telegram',
        default: false,
        alias: ['notify'],
    })
    declare notifyTelegram: boolean;
    protected notifyPrefix?: string;

    async notify(text: string, type: 'info' | 'error' = 'info'): Promise<void> {
        this.logger[type](text, {
            prefix: this.notifyPrefix,
        });

        if (this.notifyTelegram) {
            let telegramText = text;

            if (this.notifyPrefix) {
                telegramText += '\n#' + this.notifyPrefix;
            }

            await telegram.bot.sendMessage(telegram.api.userId, telegramText);
        }
    }
}
