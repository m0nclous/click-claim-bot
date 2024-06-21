import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import MtkService from '#services/mtk_service';
import { inject } from '@adonisjs/core';
import telegram from '#config/telegram';

export default class MtkCollectDaily extends BaseCommand {
    static commandName = 'mtk:collect-daily';
    static description = 'Получить награду за ежедневный вход в игре $MTK Clicker Mafia';

    @flags.boolean()
    declare notify: boolean;

    static options: CommandOptions = {
        staysAlive: false,
    };

    @inject()
    async run(service: MtkService) {
        const userInfo = await service.getUserInfo();

        if (!userInfo.dailyPrizeCollectAvailable) {
            this.logger.info(`[MTK] Награда за ежедневный вход недоступна`);
            return;
        }

        await service.collectDaily();

        this.logger.info(`[MTK] Получена награда за ежедневный вход`);

        if (this.notify) {
            await telegram.bot.sendMessage(
                telegram.api.userId,
                [`[MTK] Получена награда за ежедневный вход`].join('\n'),
                {
                    parse_mode: 'HTML',
                },
            );
        }
    }
}
