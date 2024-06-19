import { BaseCommand } from '@adonisjs/core/ace';
import { inject } from '@adonisjs/core';
import telegram from '#config/telegram';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import setEnvValueToFile from '../helpers/setEnvValueToFile.js';

// noinspection JSUnusedGlobalSymbols
export default class GemzClaim extends BaseCommand {
    static commandName = 'telegram:login';
    static description = 'Залогиниться в телеграм и получить сессию';

    @inject()
    async run() {
        const client = new TelegramClient(new StringSession(''), telegram.api.id, telegram.api.hash, {});

        await client.start({
            phoneNumber: async () => await this.prompt.ask('Номер телефона'),
            password: async () => await this.prompt.secure('Пароль'),
            phoneCode: async () => await this.prompt.ask('Код для входа'),
            onError: (err) => {
                this.logger.error(err);
                process.exit(1);
            },
        });

        setEnvValueToFile('TELEGRAM_API_SESSION', client.session.save() as unknown as string);

        this.logger.info('Успешно');
    }
}
