import { inject } from '@adonisjs/core';
import GemzGameService from '#services/GemzGameService';
import BaseGameDailyRewardCommand from '../commands-base/BaseGameDailyRewardCommand.js';

export default class GemzDailyRewardCommand extends BaseGameDailyRewardCommand {
    static commandName = 'gemz:collect-daily';
    static description = 'Получить награду за ежедневный вход в игре Gemz';

    @inject()
    async run(service: GemzGameService) {
        await super.run(service);
    }
}
