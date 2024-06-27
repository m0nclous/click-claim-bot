import telegramConfig from '#config/telegram';
import { ApplicationService } from '@adonisjs/core/types';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        telegramClient: TelegramClient;
    }
}

export default class TelegramClientProvider {
    protected app: ApplicationService;

    constructor(app: ApplicationService) {
        this.app = app;
    }

    // noinspection JSUnusedGlobalSymbols
    public async register() {
        this.app.container.singleton('telegramClient', async () => {
            const { getSessionAuthKey } = await import('../helpers/telegram.js');

            const session = new StringSession((await getSessionAuthKey()) ?? '');

            session.setDC(telegramConfig.api.dc.id, telegramConfig.api.dc.ip, telegramConfig.api.dc.port);

            return new TelegramClient(session, telegramConfig.api.id, telegramConfig.api.hash, {
                connectionRetries: 5,
            });
        });
    }
}
