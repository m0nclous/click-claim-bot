import BaseGameTapCommand from '../commands-base/BaseGameTapCommand.js';
import MemeFiGameService from '#services/MemeFiGameService';
import { flags } from '@adonisjs/core/ace';

export default class MemefiTapCommand extends BaseGameTapCommand {
    @flags.string({
        description: 'Вектор отправляемого тапа',
        default: '2,2,2,2',
    })
    declare vector: string;

    static commandName = 'memefi:tap';
    static description = 'Отправить тапы в игре MemeFI';

    async run(): Promise<void> {
        const service: MemeFiGameService = new MemeFiGameService(this.userId);

        await super.run(service, { vector: this.vector });
    }
}
