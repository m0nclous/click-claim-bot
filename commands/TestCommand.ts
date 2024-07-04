import SeedGameService, { Egg, GetMarketResponse } from '#services/SeedGameService';
import BaseGameCommand from '../commands-base/BaseGameCommand.js';
import telegramBot from '#services/TelegramBotService';
import { flags } from '@adonisjs/core/ace';

// noinspection JSUnusedGlobalSymbols
export default class SeedTestCommand extends BaseGameCommand {
    static commandName = 'seed:test';
    static description = 'Отправить тапы в игре MTK';

    @flags.string({
        description: 'Тип яиц',
        default: 'common',
    })
    declare marketEggType: Egg['egg_type'];

    async run(): Promise<void> {
        const service: SeedGameService = new SeedGameService(this.userId);

        setInterval(async () => {
            const marketData: GetMarketResponse = await service.getMarket(this.marketEggType);
            const eggs = marketData.data.items.map((egg: Egg) => {
                egg.price_gross /= 1000000000;

                return egg;
            });

            const averagePrice: number = +(eggs
                    .reduce((accumulator: number, egg: Egg) => accumulator + egg.price_gross, 0)
                / eggs.length).toFixed(2);

            for (const egg of eggs) {
                const priceDiffPercent = egg.price_gross / averagePrice * 100;

                if (priceDiffPercent < 70) {
                    console.log(egg, priceDiffPercent, averagePrice);

                    service.buyMarket(egg.id).then(async () => {
                        telegramBot.bot.telegram
                            .sendMessage(this.userId, `Куплено яйцо за ${egg.price_gross} (${priceDiffPercent}%)\n#SEED`)
                            .then();

                        const orderPrice = +(+averagePrice.toFixed(0) - +averagePrice.toFixed(0) / 100 * 5).toFixed(0);

                        await service.sellMarket(egg.egg_id, orderPrice * 1000000000).then(() => {
                            telegramBot.bot.telegram
                                .sendMessage(this.userId, `Выставлен ордер ${orderPrice}\nAverage: ${averagePrice}\n#SEED`)
                                .then();
                        }).catch(() => {
                            telegramBot.bot.telegram
                                .sendMessage(this.userId, `Не удалось выставить ордер ${orderPrice}\nAverage: ${averagePrice}\n#SEED`)
                                .then();
                        });
                    }).catch(async () => {
                        await telegramBot.bot.telegram.sendMessage(this.userId, `Не удалось купить яйцо за ${egg.price_gross} (${priceDiffPercent}%)\n#SEED`);
                    });
                }
            }
        }, 800);
    }
}
