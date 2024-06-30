import BaseEnergyResetCommand from '../commands-base/BaseEnergyResetCommand.js';
import { inject } from '@adonisjs/core';
import GemzGameService from '#services/GemzGameService';

export default class GemzEnergyResetCommand extends BaseEnergyResetCommand {
    static commandName = 'gemz:energy-reset';
    static description = 'Восстановить энергию в игре Gemz';

    @inject()
    async run(service: GemzGameService) {
        await super.run(service);
    }
}
