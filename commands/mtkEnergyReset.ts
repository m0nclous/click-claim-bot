import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import ace from '@adonisjs/core/services/ace';
import MtkGameService from '#services/MtkGameService';
import telegramBot from '#services/TelegramBotService';

// noinspection JSUnusedGlobalSymbols
export default class MtkEnergyReset extends BaseCommand {
    static commandName = 'mtk:energy-reset';
    static description = 'Восстановить энергию в игре $MTK Clicker Mafia';

    @flags.number({
        description: 'ID пользователя телеграм',
        required: true,
    })
    declare userId: number;

    @flags.boolean()
    declare notify: boolean;

    @flags.boolean()
    declare claim: boolean;

    static options: CommandOptions = {
        staysAlive: false,
        startApp: true,
    };

    async run() {
        const service: MtkGameService = new MtkGameService(this.userId);

        await service.login();

        try {
            await service.energyReset();
        } catch (e) {
            this.logger.info('[MTK] Недостаточно energyResets');
        }

        this.logger.info('[MTK] Энергия восстановлена');

        if (this.notify) {
            await telegramBot.sendMessage(this.userId, ['[MTK] Энергия восстановлена'].join('\n'), {
                parse_mode: 'HTML',
            });
        }

        if (this.claim) {
            const claimCommandArgs = [];

            if (this.notify) {
                claimCommandArgs.push('--notify');
            }

            await ace.exec('mtk:claim', claimCommandArgs);
        }
    }
}
