import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import { inject } from '@adonisjs/core';
import telegram from '#config/telegram';
import ace from '@adonisjs/core/services/ace';
import MtkGameService from '#services/MtkGameService';

export default class MtkEnergyReset extends BaseCommand {
    static commandName = 'mtk:energy-reset';
    static description = 'Восстановить энергию в игре $MTK Clicker Mafia';

    @flags.boolean()
    declare notify: boolean;

    @flags.boolean()
    declare claim: boolean;

    static options: CommandOptions = {
        staysAlive: false,
        startApp: true,
    };

    @inject()
    async run(service: MtkGameService) {
        // const userInfo = await service.getUserInfo();
        //
        // if (!userInfo.energyResets) {
        //     this.logger.info(`[MTK] Недостаточно energyResets`);
        //     return;
        // }

        await service.login();

        try {
            await service.energyReset();
        } catch (e) {
            this.logger.info(`[MTK] Недостаточно energyResets`);
        }

        this.logger.info(`[MTK] Энергия восстановлена`);

        if (this.notify) {
            await telegram.bot.sendMessage(telegram.api.userId, [`[MTK] Энергия восстановлена`].join('\n'), {
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
