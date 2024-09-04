import { ApplicationService } from '@adonisjs/core/types';
import type { FluffCrusadeKeyBufferService } from '#services/FluffCrusadeKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        fluffCrusadeKeyBuffer: FluffCrusadeKeyBufferService;
    }
}

export default class FluffCrusadeKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('fluffCrusadeKeyBuffer', async () => {
            const { FluffCrusadeKeyBufferService } = await import('#services/FluffCrusadeKeyBufferService');

            return new FluffCrusadeKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
