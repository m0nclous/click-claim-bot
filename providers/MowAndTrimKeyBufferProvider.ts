import { ApplicationService } from '@adonisjs/core/types';
import type { MowAndTrimKeyBufferService } from '#services/MowAndTrimKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mowAndTrimKeyBuffer: MowAndTrimKeyBufferService;
    }
}

export default class MowAndTrimKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('mowAndTrimKeyBuffer', async () => {
            const { MowAndTrimKeyBufferService } = await import('#services/MowAndTrimKeyBufferService');

            return new MowAndTrimKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
