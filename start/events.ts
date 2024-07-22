import emitter from '@adonisjs/core/services/emitter';
import app from '@adonisjs/core/services/app';
import { TelegramBotService } from '#services/TelegramBotService';
import type {
    ISessionExpiredErrorEvent,
    ISessionExpiredEvent,
    ITapErrorEvent,
    ITapEvent,
} from '#services/BaseClickBotService';
import type { IClaimErrorEvent, IClaimEvent } from '#services/BaseClaimBotService';

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

export const notifyTapError = async (data: ITapErrorEvent<ITapEvent>) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    const messageLines = ['⚠️ Ошибка отправки тапов'];

    if (data.quantity) {
        messageLines.push(`Количество: <b>${data.quantity}</b>`);
    }

    if (data.error.data) {
        messageLines.push(`<pre><code class="json">${JSON.stringify(data.error.data, null, 4)}</code></pre>`);
    } else {
        messageLines.push(`<pre>${data.error.message}</pre>`);
    }

    messageLines.push(`#${data.self.getGameName()}`);

    await telegramBot.bot.telegram.sendMessage(data.userId, messageLines.join('\n'), {
        parse_mode: 'HTML',
    });
};

export const notifyClaimError = async (data: IClaimErrorEvent) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    const messageLines = ['⚠️ Ошибка сбора награды'];

    if (data.error.data) {
        messageLines.push(`<pre><code class="json">${JSON.stringify(data.error.data, null, 4)}</code></pre>`);
    } else {
        messageLines.push(`<pre>${data.error.message}</pre>`);
    }

    messageLines.push(`#${data.self.getGameName()}`);

    await telegramBot.bot.telegram.sendMessage(data.userId, messageLines.join('\n'), {
        parse_mode: 'HTML',
    });
};

export const notifySessionExpiredError = async (data: ISessionExpiredErrorEvent<ISessionExpiredEvent>) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    await telegramBot.bot.telegram.sendMessage(
        data.userId,
        [
            '⚠️ Ошибка текущей сессии',
            `<pre><code class="json">${JSON.stringify(data.error.data, null, 4)}</code></pre>`,
            `#${data.self.getGameName()}`,
        ].join('\n'),
        {
            parse_mode: 'HTML',
        },
    );
};

export const notifyClaim = async (data: IClaimEvent) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    await telegramBot.bot.telegram.sendMessage(
        data.userId,
        ['✅ Успешно собрана награда', `#${data.self.getGameName()}`].join('\n'),
        {
            parse_mode: 'HTML',
        },
    );
};

emitter.on('mtk:tap', notifyTap);
emitter.on('gemz:tap', notifyTap);
emitter.on('memeFi:tap', notifyTap);
emitter.on('mine2mine:tap', notifyTap);

emitter.on('bot:claim', notifyClaim);

emitter.on('bot:tap:error', notifyTapError);
emitter.on('bot:claim:error', notifyClaimError);

emitter.on<any, any>('gemz:tap:error', notifyTapError);
emitter.on<any, any>('gemz:session-expired:error', notifySessionExpiredError);
