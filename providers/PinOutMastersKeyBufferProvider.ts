import { ApplicationService } from '@adonisjs/core/types';
import type { PinOutMastersKeyBufferService } from '#services/PinOutMastersKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        pinOutMastersKeyBuffer: PinOutMastersKeyBufferService;
    }
}

export default class CountMastersKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('pinOutMastersKeyBuffer', async () => {
            const { PinOutMastersKeyBufferService } = await import('#services/PinOutMastersKeyBufferService');

            return new PinOutMastersKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
