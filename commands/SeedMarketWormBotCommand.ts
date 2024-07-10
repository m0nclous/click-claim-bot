// noinspection DuplicatedCode

import SeedGameService, { GetMarketResponse, Worm } from '#services/SeedGameService';
import BaseGameCommand from '../commands-base/BaseGameCommand.js';
import { flags } from '@adonisjs/core/ace';
import { average, percentageDecrease } from '#helpers/math';
import logger from '@adonisjs/core/services/logger';
import { HTTPError } from 'ky';

// noinspection JSUnusedGlobalSymbols
export default class SeedMarketWormBotCommand extends BaseGameCommand {
    static commandName = 'seed:market-worm-bot';
    static description = 'Бот автоматической торговли червяками';

    @flags.string({
        description: 'Тип червяка',
        default: 'common',
    })
    declare marketWormType: Worm['worm_type'];

    @flags.number({
        description: 'Интервал запросов на маркет (ms)',
        default: 1000,
    })
    declare interval: number;

    async run(): Promise<void> {
        const service: SeedGameService = new SeedGameService(this.userId);
        this.notifyPrefix = service.getGameName();

        setInterval(async () => {
            const marketData: GetMarketResponse<Worm> = await service.getMarketWorm(this.marketWormType);
            const worms: Worm[] = marketData.data.items.map((worm: Worm) => {
                worm.price_gross /= 1000000000;

                return worm;
            });

            const averageWormPrice: number = Math.floor(average(worms.map((worm: Worm) => worm.price_gross)));

            for (const worm of worms) {
                const pricePercentageDecrease: number = Math.floor(percentageDecrease(worm.price_gross, averageWormPrice));

                if (pricePercentageDecrease > 25) {
                    service.buyMarket(worm.id).then(() => {
                        this.notify([
                            `[Червяк #${worm.worm_id.substring(worm.worm_id.length - 9).toUpperCase()}] Покупка ордера ✅`,
                            `Стоимость: ${worm.price_gross}`,
                            `Ср. рыночная цена: ${averageWormPrice}`,
                            `Выгода: ${pricePercentageDecrease}%`,
                            `Редкость: ${worm.worm_type}`,
                        ].join('\n'));

                        const orderPrice: number = Math.floor(averageWormPrice * 0.95);

                        service.sellMarketEgg(worm.worm_id, orderPrice * 1000000000).then(() => {
                            this.notify([
                                `[Червяк #${worm.worm_id.substring(worm.worm_id.length - 9).toUpperCase()}] Выставлен ордер 💸`,
                                `Стоимость: ${orderPrice}`,
                                `Ср. рыночная цена: ${averageWormPrice}`,
                                `Редкость: ${worm.worm_type}`,
                            ].join('\n'));
                        }).catch((error) => {
                            logger.error(error);

                            this.notify([
                                `[Червяк #${worm.worm_id.substring(worm.worm_id.length - 9).toUpperCase()}] Не удалось выставить ордер ❗️`,
                                `Стоимость: ${orderPrice}`,
                                `Ср. рыночная цена: ${averageWormPrice}`,
                                `Редкость: ${worm.worm_type}`,
                            ].join('\n'), 'error');
                        });
                    }).catch(async (error: HTTPError | Error) => {
                        let errorText = error.message;

                        if (error instanceof HTTPError) {
                            errorText = await error.response.json().then((json) => JSON.stringify(json, null, 4)).catch(() => error.response.text());
                        }

                        this.notify([
                            `[Червяк #${worm.worm_id.substring(worm.worm_id.length - 9).toUpperCase()}] Не удалось купить ордер ⚠️`,
                            `Стоимость: ${worm.price_gross}`,
                            `Ср. рыночная цена: ${averageWormPrice}`,
                            `Выгода: ${pricePercentageDecrease}%`,
                            `Редкость: ${worm.worm_type}`,
                            `<pre><code class="log">${errorText}</code></pre>`,
                        ].join('\n'), 'error').then();

                        if (error instanceof HTTPError && [400, 404].includes(error.response.status)) {
                            return;
                        }

                        logger.error(error);
                    });
                }
            }
        }, this.interval);
    }
}
