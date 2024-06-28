import env from '#start/env';
import { Telegraf } from 'telegraf';
import { defineConfig } from '#services/TelegramService';

const telegramConfig = defineConfig({
    id: env.get('TELEGRAM_API_ID'),
    userId: env.get('TELEGRAM_API_USER_ID'),
    hash: env.get('TELEGRAM_API_HASH'),
    sessionName: 'telegram-session',
    dc: {
        id: 2,
        ip: '149.154.167.50',
        port: 443,
    },
});

export default telegramConfig;

export const bot = new Telegraf(env.get('TELEGRAM_BOT_TOKEN')).telegram;
