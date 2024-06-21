import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import BaseGameService, { HasDailyReward } from '#services/BaseGameService';
import telegram from '#config/telegram';

export default abstract class BaseGameDailyRewardCommand extends BaseCommand {
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

    async run(service: BaseGameService & HasDailyReward) {
        await service.login();

        try {
            await service.collectDaily();
        } catch (error) {
            this.logger.error(error);

            return this.notify('Награда за ежедневный вход недоступна');
        }

        await this.notify('Получена награда за ежедневный вход');
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

            await telegram.bot.sendMessage(telegram.api.userId, telegramText);
        }
    }
}
