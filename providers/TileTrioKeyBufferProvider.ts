import { ApplicationService } from '@adonisjs/core/types';
import type { TileTrioKeyBufferService } from '#services/TileTrioKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        tileTrioKeyBuffer: TileTrioKeyBufferService;
    }
}

export default class TwerkKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('tileTrioKeyBuffer', async () => {
            const { TileTrioKeyBufferService } = await import('#services/TileTrioKeyBufferService');

            return new TileTrioKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
