import { ApplicationService } from '@adonisjs/core/types';
import type { ZoopolisKeyBufferService } from '#services/ZoopolisKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        zoopolisKeyBuffer: ZoopolisKeyBufferService;
    }
}

export default class ZoopolisKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('zoopolisKeyBuffer', async () => {
            const { ZoopolisKeyBufferService } = await import('#services/ZoopolisKeyBufferService');

            return new ZoopolisKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
