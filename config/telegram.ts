import env from '#start/env';
import { defineConfig } from '#services/TelegramService';

const telegramConfig = defineConfig({
    id: env.get('TELEGRAM_API_ID'),
    hash: env.get('TELEGRAM_API_HASH'),
    dc: {
        id: 2,
        ip: '149.154.167.50',
        port: 443,
    },
});

export default telegramConfig;
