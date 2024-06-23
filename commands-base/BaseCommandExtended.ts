import { BaseCommand, flags } from '@adonisjs/core/ace';
import telegram from '#config/telegram';
import { getSession } from '../helpers/redis/index.js';

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

            await telegram.bot.telegram.sendMessage(telegram.api.userId, telegramText);
        }
    }

    async prepare() {
        const data =  await getSession(String(telegram.api.userId));

        if (data && data.isStart) {
            return Promise.resolve();
        }

        return Promise.reject();
    }
}
