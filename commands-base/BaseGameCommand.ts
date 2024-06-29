import { BaseCommand, flags } from '@adonisjs/core/ace';
import telegram from '#config/telegram';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import telegramBot from '#services/TelegramBotService';

export default abstract class BaseGameCommand extends BaseCommand {
    static options: CommandOptions = {
        startApp: true,
        staysAlive: true,
        allowUnknownFlags: false,
    };

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

            await telegramBot.sendMessage(telegram.userId, telegramText);
        }
    }
}
