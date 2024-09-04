import env from '#start/env';
import { defineConfig } from '#services/TelegramService';

const telegramConfig = defineConfig({
    id: env.get('TELEGRAM_API_ID'),
    hash: env.get('TELEGRAM_API_HASH'),
    dc: {
        id: env.get('TELEGRAM_DC_ID', 2),
        ip: env.get('TELEGRAM_DC_IP', '149.154.167.50'),
        port: env.get('TELEGRAM_DC_PORT', 443),
    },
});

export default telegramConfig;
