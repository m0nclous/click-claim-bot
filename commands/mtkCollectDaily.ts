import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

// noinspection JSUnusedGlobalSymbols
export default class MtkCollectDaily extends BaseCommand {
    static commandName = 'mtk:collect-daily';
    static description = 'Получить награду за ежедневный вход в игре $MTK Clicker Mafia';

    @flags.number({
        description: 'ID пользователя телеграм',
        required: true,
    })
    declare userId: number;

    @flags.boolean()
    declare notify: boolean;

    static options: CommandOptions = {
        staysAlive: false,
    };

    async run() {
        throw Error('Not Implemented');
    }
}
