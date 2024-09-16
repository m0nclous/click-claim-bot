import emitter from '@adonisjs/core/services/emitter';
import app from '@adonisjs/core/services/app';
import telegramBot, { TelegramBotService } from '#modules/telegramBot/services/TelegramBotService';
import type {
    ISessionExpiredErrorEvent,
    ISessionExpiredEvent,
    ITapErrorEvent,
    ITapEvent,
} from '#services/BaseClickBotService';
import type { IClaimErrorEvent, IClaimEvent } from '#services/BaseClaimBotService';
import { IZavodCraftErrorEvent, IZavodCraftEvent } from '#services/ZavodCraftBotService';
import { IUnauthenticatedErrorEvent } from '#services/BaseBotService';
import type { TelegramService } from '#services/TelegramService';
import {
    IFartyBeetleCraftErrorEvent,
    IFartyBeetleCraftFinishEvent,
} from '#services/FartyBeetleCraftBotService';
import { IClockReward } from '#services/FartyBeetleGameService';

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

export const notifyZavodCraftFinishError = async (data: IZavodCraftErrorEvent) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    const messageLines = ['⚠️ Ошибка сбора деталей'];

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

export const notifyFartyBeetleCraftFinishError = async (data: IFartyBeetleCraftErrorEvent) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    const messageLines = ['⚠️ Ошибка сбора жука'];

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

export const notifyZavodCraftFinish = async (data: IZavodCraftEvent) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    await telegramBot.bot.telegram.sendMessage(
        data.userId,
        ['✅ Успешно собраны детали', `#${data.self.getGameName()}`].join('\n'),
        {
            parse_mode: 'HTML',
        },
    );
};

export const notifyFartyBeetleCraftFinish = async (data: IFartyBeetleCraftFinishEvent) => {
    const telegramBot: TelegramBotService = await app.container.make('telegramBot', [data.userId]);

    await telegramBot.bot.telegram.sendMessage(
        data.userId,
        [
            '✅ Жук успешно собран',
            `Задание: ${data.task.description}`,
            `Награды: ${data.rewards.map((reward: IClockReward) => `${reward.value} (${reward.type})`).join(', ')}`,
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
emitter.on('mine2mine:tap', notifyTap);
emitter.on('city-holders:tap', notifyTap);

emitter.on('bot:claim', notifyClaim);
emitter.on('bot:zavod:craft:finish', notifyZavodCraftFinish);
emitter.on('bot:farty-beetle:craft:finish', notifyFartyBeetleCraftFinish);

emitter.on('bot:tap:error', notifyTapError);
emitter.on('bot:claim:error', notifyClaimError);
emitter.on('bot:zavod:craft:error', notifyZavodCraftFinishError);
emitter.on('bot:farty-beetle:craft:error', notifyFartyBeetleCraftFinishError);

emitter.on<any, any>('gemz:tap:error', notifyTapError);
emitter.on<any, any>('gemz:session-expired:error', notifySessionExpiredError);

emitter.on('bot:error:unauthenticated', async (data: IUnauthenticatedErrorEvent) => {
    await telegramBot.bot.telegram.sendMessage(
        data.userId,
        'Не удалось получить доступ к сессии Telegram!\nПроизведена очистка настроек бота.\nДля продолжения необходимо повторно войти /login',
    );

    const telegram: TelegramService = await app.container.make('telegram', [data.userId]);
    await telegram.forgetSession();
});
