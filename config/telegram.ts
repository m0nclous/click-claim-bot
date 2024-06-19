import env from '#start/env';
import { TelegramClient } from 'telegram';
import { Telegraf } from 'telegraf';
import { StoreSession } from 'telegram/sessions/index.js';

const botToken = env.get('TELEGRAM_BOT_TOKEN');

const telegramConfig = {
    api: {
        id: env.get('TELEGRAM_API_ID'),
        userId: env.get('TELEGRAM_API_USER_ID'),
        hash: env.get('TELEGRAM_API_HASH'),
        session: new StoreSession('my_session'),
    },

    bot: (new Telegraf(botToken)).telegram,
};

export default telegramConfig;

export const client = new TelegramClient(
    telegramConfig.api.session,
    telegramConfig.api.id,
    telegramConfig.api.hash,
    {
        connectionRetries: 5,
    }
);
