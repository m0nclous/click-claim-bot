import { ApplicationService } from '@adonisjs/core/types';
import type { PolysphereKeyBufferService } from '#services/PolysphereKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        polysphereKeyBuffer: PolysphereKeyBufferService;
    }
}

export default class PolysphereKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('polysphereKeyBuffer', async () => {
            const { PolysphereKeyBufferService } = await import('#services/PolysphereKeyBufferService');

            return new PolysphereKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
