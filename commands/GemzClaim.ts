import { BaseCommand, flags } from '@adonisjs/core/ace';
import { inject } from '@adonisjs/core';
import GemzGameService from '#services/GemzGameService';
import telegram from '#config/telegram';

// noinspection JSUnusedGlobalSymbols
export default class GemzClaim extends BaseCommand {
    static commandName = 'gemz:claim';
    static description = 'Отправить тапы в игре Gemz';

    @flags.string({
        description: 'Количество тапов для отправки',
        default: '1'
    })
    declare quantity: string;

    @flags.boolean()
    declare notify: boolean;

    @inject()
    async run(service: GemzGameService) {
        await service.login();

        const tapsQuantity = parseInt(this.quantity);

        try {
            await service.tap(tapsQuantity);
        } catch (error) {
            if (this.notify) {
                await telegram.bot.sendMessage(telegram.api.userId, `[Gemz] Ошибка во время отправки тапов: ${tapsQuantity}`);
            }

            this.logger.error(`Ошибка во время отправки тапов: ${tapsQuantity}`, {
                prefix: 'Gemz',
            });

            return;
        }

        if (this.notify) {
            await telegram.bot.sendMessage(telegram.api.userId, `[Gemz] Успешно отправлено тапов: ${tapsQuantity}`);
        }

        this.logger.info(`Успешно отправлено тапов: ${tapsQuantity}`, {
            prefix: 'Gemz',
        });
    }
}
