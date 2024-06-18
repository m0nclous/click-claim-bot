import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import MtkService from '#services/mtk_service';
import { inject } from '@adonisjs/core';
import telegram from '#config/telegram';

export default class MtkInfo extends BaseCommand {
    static commandName = 'mtk:info';
    static description = 'Показать информацию в игре $MTK Clicker Mafia';

    @flags.boolean()
    declare notify: boolean;

    static options: CommandOptions = {
        staysAlive: false,
    };

    @inject()
    async run(service: MtkService) {
        const userInfo = await service.getUserInfo();

        const currentBalance = userInfo.mtkBalance.toLocaleString('ru-RU');
        const currentEnergy = userInfo.currentEnergy.toLocaleString('ru-RU');
        const maxEnergy = (userInfo.energyLevel * 250 + 2500).toLocaleString('ru-RU');
        const dailyAvailable = userInfo.dailyPrizeCollectAvailable;

        this.logger.info(`[MTK] Balance: ${currentBalance}`);
        this.logger.info(`[MTK] Energy: ${currentEnergy} / ${maxEnergy}`);
        this.logger.info(`[MTK] Energy Resets: ${userInfo.energyResets}`);
        this.logger.info(`[MTK] Daily Available: ${dailyAvailable ? 'true' : 'false'}`);

        if (this.notify) {
            await telegram.bot.sendMessage(telegram.api.userId, [
                `[MTK] Balance: ${currentBalance}`,
                `[MTK] Energy: ${currentEnergy} / ${maxEnergy}`,
                `[MTK] Energy Resets: ${userInfo.energyResets}`,
                `[MTK] Daily Available: ${dailyAvailable ? 'true' : 'false'}`,
            ].join('\n'), {
                parse_mode: 'HTML',
            });
        }
    }
}
