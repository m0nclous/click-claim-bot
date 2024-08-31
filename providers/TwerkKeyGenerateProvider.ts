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
            const { TwerkKeyGenerateService } = await import('#services/TwerkKeyGenerateService');

            return new TwerkKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
