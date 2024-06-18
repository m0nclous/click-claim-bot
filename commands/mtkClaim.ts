import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import MtkService from '#services/mtk_service';
import { inject } from '@adonisjs/core';
import telegram, { client } from '#config/telegram';

export default class MtkClaim extends BaseCommand {
    static commandName = 'mtk:claim';
    static description = 'Прокликать энергию в игре $MTK Clicker Mafia';

    @flags.boolean()
    declare notify: boolean;

    static options: CommandOptions = {
        staysAlive: false,
    };

    @inject()
    async run(service: MtkService) {
        const userInfo = await service.getUserInfo();

        const isClaimed = await service.claim();

        if (!isClaimed) {
            this.logger.info(`[MTK] Недостаточно энергии для Claim`);
            return;
        }

        this.logger.info(`[MTK] Прокликано ${userInfo.currentEnergy.toLocaleString('ru-RU')} энергии`);

        if (this.notify) {
            await telegram.bot.sendMessage(telegram.api.userId, [
                `[MTK] Прокликано ${userInfo.currentEnergy.toLocaleString('ru-RU')} энергии`,
            ].join('\n'), {
                parse_mode: 'HTML',
            });
        }
    }

    async completed() {
        await client.disconnect();
    }
}
