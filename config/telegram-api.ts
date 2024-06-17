import { StringSession } from 'telegram/sessions/index.js';
import env from '#start/env';
import { TelegramClient } from 'telegram';

const telegramApiConfig = {
    id: env.get('TELEGRAM_API_ID'),
    hash: env.get('TELEGRAM_API_HASH'),
    session: new StringSession(env.get('TELEGRAM_API_SESSION')),
};

export default telegramApiConfig;

export const client = new TelegramClient(telegramApiConfig.session, telegramApiConfig.id, telegramApiConfig.hash, {
    connectionRetries: 5,
});
