import { inject } from '@adonisjs/core';
import MtkGameService from '#services/MtkGameService';
import BaseGameTapCommand from '../commands-base/BaseGameTapCommand.js';

// noinspection JSUnusedGlobalSymbols
export default class MtkTapCommand extends BaseGameTapCommand {
    static commandName = 'mtk:tap';
    static description = 'Отправить тапы в игре MTK';

    @inject()
    async run(service: MtkGameService): Promise<void> {
        await super.run(service);
    }
}
