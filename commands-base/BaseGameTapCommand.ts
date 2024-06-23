import { BaseCommand, flags } from '@adonisjs/core/ace';
import telegram from '#config/telegram';
import BaseGameService, { HasTap } from '#services/BaseGameService';
import { CommandOptions } from '@adonisjs/core/types/ace';

export default abstract class BaseGameTapCommand extends BaseCommand {
    @flags.number({
        description: 'Количество тапов для отправки',
        default: 1,
    })
    declare quantity: number;

    @flags.boolean({
        description: 'Отправить уведомление в Telegram',
        default: false,
        alias: ['notify'],
    })
    declare notifyTelegram: boolean;

    static options: CommandOptions = {
        startApp: true,
        staysAlive: true,
        allowUnknownFlags: false,
    };

    protected notifyPrefix?: string;

    async run(service: BaseGameService & HasTap) {
        this.notifyPrefix = service.getGameName();

        await service.login();

        try {
            await service.tap(this.quantity);
        } catch (error) {
            this.logger.error(error);

            return this.notify(`Ошибка во время отправки тапов: ${this.quantity}`, 'error');
        }

        await this.notify(`Успешно отправлено тапов: ${this.quantity}`);
    }

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
}
