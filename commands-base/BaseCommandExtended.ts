import { BaseCommand, flags } from '@adonisjs/core/ace';
import telegramConfig, { bot } from '#config/telegram';
import telegramBot from '#services/TelegramBotService';

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

            await bot.sendMessage(telegramConfig.userId, telegramText);
        }
    }

    async prepare() {
        const botIsStarted: boolean = await telegramBot.isStarted(telegramConfig.userId);

        if (!botIsStarted) {
            return Promise.reject();
        }

        return Promise.resolve();
    }
}
