import MtkGameService from '#services/MtkGameService';
import BaseGameTapCommand from '../commands-base/BaseGameTapCommand.js';

// noinspection JSUnusedGlobalSymbols
export default class MtkTapCommand extends BaseGameTapCommand {
    static commandName = 'mtk:tap';
    static description = 'Отправить тапы в игре MTK';

    async run(): Promise<void> {
        const service: MtkGameService = new MtkGameService(this.userId);

        await super.run(service);
    }
}
