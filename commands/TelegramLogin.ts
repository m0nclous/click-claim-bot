import { BaseCommand } from '@adonisjs/core/ace';
import { inject } from '@adonisjs/core';
import { client } from '#config/telegram';

// noinspection JSUnusedGlobalSymbols
export default class GemzClaim extends BaseCommand {
    static commandName = 'telegram:login';
    static description = 'Залогиниться в телеграм и получить сессию';

    @inject()
    async run() {
        await client.start({
            phoneNumber: async () => await this.prompt.ask('Номер телефона'),
            password: async () => await this.prompt.secure('Пароль'),
            phoneCode: async () => await this.prompt.ask('Код для входа'),
            onError: (err) => {
                this.logger.error(err);
                process.exit(1);
            },
        });

        this.logger.info('Успешно');
    }
}
