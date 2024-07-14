import emitter from '@adonisjs/core/services/emitter';
import app from '@adonisjs/core/services/app';
import { TelegramBotService } from '#services/TelegramBotService';
import type { ITapErrorEvent, ITapEvent } from '#services/BaseClickBotService';

export const notifyTap = async (data: ITapEvent) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    await telegramBot.bot.telegram.sendMessage(
        data.userId,
        ['✅ Отправлены тапы', `Количество: <b>${data.quantity}</b>`, `#${data.self.getGameName()}`].join(
            '\n',
        ),
        {
            parse_mode: 'HTML',
        },
    );
};

export const notifyTapError = async (data: ITapErrorEvent<any>) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    await telegramBot.bot.telegram.sendMessage(
        data.userId,
        [
            '⚠️ Ошибка отправки тапов',
            `Количество: <b>${data.quantity}</b>`,
            `<pre><code class="json">${JSON.stringify(data.error.data, null, 4)}</code></pre>`,
            `#${data.self.getGameName()}`,
        ].join('\n'),
        {
            parse_mode: 'HTML',
        },
    );
};

emitter.on('mtk:tap', notifyTap);
emitter.on('gemz:tap', notifyTap);
emitter.on('memeFi:tap', notifyTap);

emitter.on('gemz:tap:error', notifyTapError);
