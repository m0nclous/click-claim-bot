import emitter from '@adonisjs/core/services/emitter';
import app from '@adonisjs/core/services/app';
import { TelegramBotService } from '#services/TelegramBotService';
import MtkGameService from '#services/MtkGameService';
import GemzGameService from '#services/GemzGameService';

emitter.on('mtk:tap', async (data) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [
        data.userId,
    ]);

    const mtkGameService: MtkGameService = await app.container.make('mtkGameService', [
        data.userId,
    ]);

    await telegramBot.bot.telegram.sendMessage(data.userId, [
        `Успешно отправлено тапов: ${data.quantity}`,
        `#${mtkGameService.getGameName()}`,
    ].join('\n'));
});

emitter.on('gemz:tap', async (data) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [
        data.userId,
    ]);

    const gemzGameService: GemzGameService = await app.container.make('gemzGameService', [
        data.userId,
    ]);

    await telegramBot.bot.telegram.sendMessage(data.userId, [
        `Успешно отправлено тапов: ${data.quantity}`,
        `#${gemzGameService.getGameName()}`,
    ].join('\n'));
});
