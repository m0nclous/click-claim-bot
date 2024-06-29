import BaseGameService, { HasEnergyRecharge } from '#services/BaseGameService';
import BaseGameCommand from './BaseGameCommand.js';

export default abstract class BaseEnergyResetCommand extends BaseGameCommand {
    async run(service: BaseGameService & HasEnergyRecharge) {
        await service.login();

        try {
            await service.energyReset();
        } catch (error) {
            this.logger.error(error);

            return this.notify('Ошибка при восстановлении энергии', 'error');
        }

        await this.notify('Энергия восстановлена');
    }
}
