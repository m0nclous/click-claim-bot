import env from '#start/env';
import { defineConfig } from '#modules/telegramBot/services/TelegramBotService';

const telegramBotConfig = defineConfig({
    token: env.get('TELEGRAM_BOT_TOKEN'),
});

export default telegramBotConfig;
