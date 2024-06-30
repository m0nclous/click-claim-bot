import env from '#start/env';
import { defineConfig } from '#services/TelegramBotService';

const telegramBotConfig = defineConfig({
    token: env.get('TELEGRAM_BOT_TOKEN'),
    name: env.get('BOT_NAME', 'click_claim_serhio_bot'),
});

export default telegramBotConfig;
