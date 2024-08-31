import { ApplicationService } from '@adonisjs/core/types';
import { ZoopolisKeyGenerateService } from '#services/ZoopolisKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        zoopolisKeyGenerate: ZoopolisKeyGenerateService;
    }
}

export default class ZoopolisKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('zoopolisKeyGenerate', async () => {
            const { ZoopolisKeyGenerateService } = await import('#services/ZoopolisKeyGenerateService');

            return new ZoopolisKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
