import env from '#start/env';
import { TelegramClient } from 'telegram';
import { Telegraf } from 'telegraf';
import { StringSession } from 'telegram/sessions/index.js';
import { getSession } from '../helpers/redis/index.js';

const botToken = env.get('TELEGRAM_BOT_TOKEN');
const userId = env.get('TELEGRAM_API_USER_ID');

const sessionToken = await getSession(userId.toString());

const stringSession = new StringSession(sessionToken || undefined);

const telegramConfig = {
    api: {
        id: env.get('TELEGRAM_API_ID'),
        userId,
        hash: env.get('TELEGRAM_API_HASH'),
        session: stringSession,
    },

    bot: new Telegraf(botToken).telegram,
};

export default telegramConfig;

export const client = new TelegramClient(
    telegramConfig.api.session,
    telegramConfig.api.id,
    telegramConfig.api.hash,
    {
        connectionRetries: 5,
    },
);
