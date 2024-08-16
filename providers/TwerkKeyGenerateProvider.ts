import { ApplicationService } from '@adonisjs/core/types';
import { TwerkKeyGenerateService } from '#services/TwerkKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        twerkKeyGenerate: TwerkKeyGenerateService;
    }
}

export default class TwerkKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('twerkKeyGenerate', async () => {
            const clientId: string = crypto.randomUUID();

            const { TwerkKeyGenerateService } = await import('#services/TwerkKeyGenerateService');

            return new TwerkKeyGenerateService(clientId);
        });
    }
}
