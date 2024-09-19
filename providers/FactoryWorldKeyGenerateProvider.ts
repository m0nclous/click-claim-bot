import { ApplicationService } from '@adonisjs/core/types';
import { FactoryWorldKeyGenerateService } from '#services/FactoryWorldKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        factoryWorldKeyGenerate: FactoryWorldKeyGenerateService;
    }
}

export default class FactoryWorldKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('factoryWorldKeyGenerate', async () => {
            const { FactoryWorldKeyGenerateService } = await import(
                '#services/FactoryWorldKeyGenerateService'
            );

            return new FactoryWorldKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
