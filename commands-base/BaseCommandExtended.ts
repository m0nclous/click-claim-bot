import { BaseCommand, flags } from '@adonisjs/core/ace';
import telegramBot from '#services/TelegramBotService';

// noinspection JSUnusedGlobalSymbols
export default class BaseCommandExtended extends BaseCommand {
    @flags.number({
        description: 'ID пользователя телеграм',
        required: true,
    })
    declare userId: number;

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

            await telegramBot.sendMessage(this.userId, telegramText);
        }
    }

    async prepare() {
        const botIsStarted: boolean = await telegramBot.isStarted(this.userId);

        if (!botIsStarted) {
            return Promise.reject();
        }

        return Promise.resolve();
    }
}
