import BaseGameService, { HasDailyReward } from '#services/BaseGameService';

import BaseGameCommand from './BaseGameCommand.js';
export default abstract class BaseGameDailyRewardCommand extends BaseGameCommand {
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
