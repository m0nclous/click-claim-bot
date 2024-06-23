import type { CommandOptions } from '@adonisjs/core/types/ace';
import BaseGameService, { HasEnergyRecharge } from '#services/BaseGameService';
import BaseCommandExtended from './BaseCommandExtended.js';

export default class BaseEnergyResetCommand extends BaseCommandExtended {
    static options: CommandOptions = {
        startApp: true,
        staysAlive: true,
        allowUnknownFlags: false,
    };

    async run(service: BaseGameService & HasEnergyRecharge) {
        await service.login();

        try {
            await service.energyReset();
        } catch (error) {
            this.logger.error(error);

            return this.notify('Ошибка восстановлении энергии', 'error');
        }

        await this.notify('Энергия восстановлена');
    }
}
