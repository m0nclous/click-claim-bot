import emitter from '@adonisjs/core/services/emitter';
import app from '@adonisjs/core/services/app';
import { TelegramBotService } from '#services/TelegramBotService';
import BaseGameService from '#services/BaseGameService';

export interface ITapEvent {
    self: BaseGameService;
    userId: number;
    quantity: number;
}

export const notifyTap = async (data: ITapEvent) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    await telegramBot.bot.telegram.sendMessage(
        data.userId,
        [`Успешно отправлено тапов: ${data.quantity}`, `#${data.self.getGameName()}`].join('\n'),
    );
};

emitter.on('mtk:tap', notifyTap);
emitter.on('gemz:tap', notifyTap);
