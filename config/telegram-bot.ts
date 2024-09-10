import env from '#start/env';
import { defineConfig } from '#services/TelegramBotService/index';

const telegramBotConfig = defineConfig({
    token: env.get('TELEGRAM_BOT_TOKEN'),
});

export default telegramBotConfig;
