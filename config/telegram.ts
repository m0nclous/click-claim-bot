import { StringSession } from 'telegram/sessions/index.js';
import env from '#start/env';
import { TelegramClient } from 'telegram';

const telegramConfig = {
    api: {
        id: env.get('TELEGRAM_API_ID'),
        hash: env.get('TELEGRAM_API_HASH'),
        session: new StringSession(env.get('TELEGRAM_API_SESSION')),
    }
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
