import { BaseCommand } from '@adonisjs/core/ace';
import { inject } from '@adonisjs/core';
import telegram from '#services/TelegramService';

// noinspection JSUnusedGlobalSymbols
export default class GemzClaim extends BaseCommand {
    static commandName = 'telegram:login';
    static description = 'Залогиниться в телеграм и получить сессию';

    @inject()
    async run() {
        const client = await telegram.getClient();

        await client.start({
            phoneNumber: async () => await this.prompt.ask('Номер телефона'),
            password: async () => await this.prompt.secure('Пароль'),
            phoneCode: async () => await this.prompt.ask('Код для входа'),
            onError: (err) => {
                this.logger.error(err);
                process.exit(1);
            },
        });

        const authToken: string = client.session.save() as unknown as string;
        await telegram.saveSession(authToken);

        this.logger.info('Успешно');
    }
}
