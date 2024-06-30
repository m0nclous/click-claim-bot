import env from '#start/env';
import { defineConfig } from '#services/TelegramService';

const telegramConfig = defineConfig({
    id: env.get('TELEGRAM_API_ID'),
    userId: env.get('TELEGRAM_API_USER_ID'),
    hash: env.get('TELEGRAM_API_HASH'),
    webserverHost: env.get('WEB_SERVER_HOST', 'https://2d16-92-124-163-102.ngrok-free.app'),
    sessionName: 'telegram-session',
    dc: {
        id: 2,
        ip: '149.154.167.50',
        port: 443,
    },
});

export default telegramConfig;
