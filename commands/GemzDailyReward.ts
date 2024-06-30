import GemzGameService from '#services/GemzGameService';
import BaseGameDailyRewardCommand from '../commands-base/BaseGameDailyRewardCommand.js';

// noinspection JSUnusedGlobalSymbols
export default class GemzDailyRewardCommand extends BaseGameDailyRewardCommand {
    static commandName = 'gemz:collect-daily';
    static description = 'Получить награду за ежедневный вход в игре Gemz';

    async run() {
        const service: GemzGameService = new GemzGameService(this.userId);

        await super.run(service);
    }
}
