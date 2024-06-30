import GemzGameService from '#services/GemzGameService';
import BaseGameTapCommand from '../commands-base/BaseGameTapCommand.js';

// noinspection JSUnusedGlobalSymbols
export default class GemzTapCommand extends BaseGameTapCommand {
    static commandName = 'gemz:tap';
    static description = 'Отправить тапы в игре Gemz';

    async run() {
        const service: GemzGameService = new GemzGameService(this.userId);

        await super.run(service);
    }
}
