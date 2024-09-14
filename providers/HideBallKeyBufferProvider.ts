import { ApplicationService } from '@adonisjs/core/types';
import type { HideBallKeyBufferService } from '#services/HideBallKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        hideBallKeyBuffer: HideBallKeyBufferService;
    }
}

export default class HideBallKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('hideBallKeyBuffer', async () => {
            const { HideBallKeyBufferService } = await import('#services/HideBallKeyBufferService');

            return new HideBallKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
