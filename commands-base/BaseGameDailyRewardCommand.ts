import type { CommandOptions } from '@adonisjs/core/types/ace';
import BaseGameService, { HasDailyReward } from '#services/BaseGameService';
import BaseCommandExtended from './BaseCommandExtended.js';

export default abstract class BaseGameDailyRewardCommand extends BaseCommandExtended {
    static options: CommandOptions = {
        startApp: true,
        staysAlive: true,
        allowUnknownFlags: false,
    };

    async run(service: BaseGameService & HasDailyReward) {
        await service.login();

        try {
            await service.collectDaily();
        } catch (error) {
            this.logger.error(error);

            return this.notify('Ошибка при отправке запроса на получение ежедневной награды', 'error');
        }

        await this.notify('Получена награда за ежедневный вход');
    }
}
