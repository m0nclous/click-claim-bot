import { flags } from '@adonisjs/core/ace';
import ace from '@adonisjs/core/services/ace';
import MtkGameService from '#services/MtkGameService';
import telegramBot from '#services/TelegramBotService';
import BaseGameCommand from '../commands-base/BaseGameCommand.js';

// noinspection JSUnusedGlobalSymbols
export default class MtkEnergyReset extends BaseGameCommand {
    static commandName = 'mtk:energy-reset';
    static description = 'Восстановить энергию в игре $MTK Clicker Mafia';

    @flags.boolean()
    declare claim: boolean;

    async run() {
        const service: MtkGameService = new MtkGameService(this.userId);

        await service.login();

        try {
            await service.energyReset();
        } catch (e) {
            this.logger.info('[MTK] Недостаточно energyResets');
        }

        this.logger.info('[MTK] Энергия восстановлена');

        if (this.notifyTelegram) {
            await telegramBot.bot.telegram.sendMessage(
                this.userId,
                ['[MTK] Энергия восстановлена'].join('\n'),
                {
                    parse_mode: 'HTML',
                },
            );
        }

        if (this.claim) {
            const claimCommandArgs = [];

            if (this.notifyTelegram) {
                claimCommandArgs.push('--notify');
            }

            await ace.exec('mtk:claim', claimCommandArgs);
        }
    }
}
