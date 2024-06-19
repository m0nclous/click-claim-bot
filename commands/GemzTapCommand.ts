import { inject } from '@adonisjs/core';
import GemzGameService from '#services/GemzGameService';
import BaseGameTapCommand from '../commands-base/BaseGameTapCommand.js';

// noinspection JSUnusedGlobalSymbols
export default class GemzTapCommand extends BaseGameTapCommand {
    static commandName = 'gemz:tap';
    static description = 'Отправить тапы в игре Gemz';

    @inject()
    async run(service: GemzGameService) {
        await super.run(service);
    }
}
