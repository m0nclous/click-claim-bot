import { ApplicationService } from '@adonisjs/core/types';
import { HideBallKeyGenerateService } from '#services/HideBallKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        hideBallKeyGenerate: HideBallKeyGenerateService;
    }
}

export default class HideBallKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('hideBallKeyGenerate', async () => {
            const { HideBallKeyGenerateService } = await import('#services/HideBallKeyGenerateService');

            return new HideBallKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
