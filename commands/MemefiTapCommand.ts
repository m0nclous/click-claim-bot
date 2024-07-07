import BaseGameTapCommand from '../commands-base/BaseGameTapCommand.js';
import MemeFiGameService from '#services/MemeFiGameService';

export default class MemefiTapCommand extends BaseGameTapCommand {
    static commandName = 'memefi:tap';
    static description = 'Отправить тапы в игре MemeFI';

    async run(): Promise<void> {
        const service: MemeFiGameService = new MemeFiGameService(this.userId);

        await super.run(service);
    }
}
