// noinspection DuplicatedCode

import SeedGameService, { Egg, GetMarketResponse } from '#services/SeedGameService';
import BaseGameCommand from '../commands-base/BaseGameCommand.js';
import { flags } from '@adonisjs/core/ace';
import { average, percentageDecrease } from '#helpers/math';
import logger from '@adonisjs/core/services/logger';

// noinspection JSUnusedGlobalSymbols
export default class SeedMarketBotCommand extends BaseGameCommand {
    static commandName = 'seed:market-bot';
    static description = 'Бот автоматической торговли яйцами';

    @flags.string({
        description: 'Тип яиц',
        default: 'common',
    })
    declare marketEggType: Egg['egg_type'];

    @flags.number({
        description: 'Интервал запросов на маркет (ms)',
        default: 1000,
    })
    declare interval: number;

    async run(): Promise<void> {
        const service: SeedGameService = new SeedGameService(this.userId);
        this.notifyPrefix = service.getGameName();

        setInterval(async () => {
            const marketData: GetMarketResponse = await service.getMarket(this.marketEggType);
            const eggs: Egg[] = marketData.data.items.map((egg: Egg) => {
                egg.price_gross /= 1000000000;

                return egg;
            });

            const averageEggPrice: number = Math.floor(average(eggs.map((egg: Egg) => egg.price_gross)));

            for (const egg of eggs) {
                const pricePercentageDecrease: number = Math.floor(percentageDecrease(egg.price_gross, averageEggPrice));

                if (pricePercentageDecrease > 25) {
                    service.buyMarket(egg.id).then(() => {
                        this.notify([
                            `[Яйцо #${egg.egg_id.substring(egg.egg_id.length - 9).toUpperCase()}] Покупка ордера ✅`,
                            `Стоимость: ${egg.price_gross}`,
                            `Ср. рыночная цена: ${averageEggPrice}`,
                            `Выгода: ${pricePercentageDecrease}%`,
                            `Редкость: ${egg.egg_type}`,
                        ].join('\n'));

                        const orderPrice: number = Math.floor(averageEggPrice * 0.95);

                        service.sellMarket(egg.egg_id, orderPrice * 1000000000).then(() => {
                            this.notify([
                                `[Яйцо #${egg.egg_id.substring(egg.egg_id.length - 9).toUpperCase()}] Выставлен ордер 💸`,
                                `Стоимость: ${orderPrice}`,
                                `Ср. рыночная цена: ${averageEggPrice}`,
                                `Редкость: ${egg.egg_type}`,
                            ].join('\n'));
                        }).catch((error) => {
                            logger.error(error);

                            this.notify([
                                `[Яйцо #${egg.egg_id.substring(egg.egg_id.length - 9).toUpperCase()}] Не удалось выставить ордер ❗️`,
                                `Стоимость: ${orderPrice}`,
                                `Ср. рыночная цена: ${averageEggPrice}`,
                                `Редкость: ${egg.egg_type}`,
                            ].join('\n'), 'error');
                        });
                    }).catch((error) => {
                        logger.error(error);

                        this.notify([
                            `[Яйцо #${egg.egg_id.substring(egg.egg_id.length - 9).toUpperCase()}] Не удалось купить ордер ⚠️`,
                            `Стоимость: ${egg.price_gross}`,
                            `Ср. рыночная цена: ${averageEggPrice}`,
                            `Выгода: ${pricePercentageDecrease}%`,
                            `Редкость: ${egg.egg_type}`,
                        ].join('\n'), 'error');
                    });
                }
            }
        }, this.interval);
    }
}
