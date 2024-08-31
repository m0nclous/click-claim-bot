import { ApplicationService } from '@adonisjs/core/types';
import type { CafeDashKeyBufferService } from '#services/CafeDashKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        cafeDashKeyBuffer: CafeDashKeyBufferService;
    }
}

export default class CafeDashKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('cafeDashKeyBuffer', async () => {
            const { CafeDashKeyBufferService } = await import('#services/CafeDashKeyBufferService');

            return new CafeDashKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
