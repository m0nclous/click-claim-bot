import { flags } from '@adonisjs/core/ace';
import BaseGameService, { HasTap } from '#services/BaseGameService';
import BaseGameCommand from './BaseGameCommand.js';

export default abstract class BaseGameTapCommand extends BaseGameCommand {
    @flags.number({
        description: 'Количество тапов для отправки',
        default: 1,
    })
    declare quantity: number;

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
