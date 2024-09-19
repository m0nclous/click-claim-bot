import { ApplicationService } from '@adonisjs/core/types';
import type { FactoryWorldKeyBufferService } from '#services/FactoryWorldKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        factoryWorldKeyBuffer: FactoryWorldKeyBufferService;
    }
}

export default class FactoryWorldKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('factoryWorldKeyBuffer', async () => {
            const { FactoryWorldKeyBufferService } = await import('#services/FactoryWorldKeyBufferService');

            return new FactoryWorldKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
