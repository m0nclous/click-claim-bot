import { flags } from '@adonisjs/core/ace';
import BaseGameService, { HasTap } from '#services/BaseGameService';
import { CommandOptions } from '@adonisjs/core/types/ace';
import BaseCommandExtended from './BaseCommandExtended.js';

export default abstract class BaseGameTapCommand extends BaseCommandExtended {
    @flags.number({
        description: 'Количество тапов для отправки',
        default: 1,
    })
    declare quantity: number;

    static options: CommandOptions = {
        startApp: true,
        staysAlive: true,
        allowUnknownFlags: false,
    };

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
}
