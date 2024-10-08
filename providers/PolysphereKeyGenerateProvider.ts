import { ApplicationService } from '@adonisjs/core/types';
import { PolysphereKeyGenerateService } from '#services/PolysphereKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        polysphereKeyGenerate: PolysphereKeyGenerateService;
    }
}

export default class PolysphereKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('polysphereKeyGenerate', async () => {
            const { PolysphereKeyGenerateService } = await import('#services/PolysphereKeyGenerateService');

            return new PolysphereKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
