import { ApplicationService } from '@adonisjs/core/types';
import type { CountMastersKeyBufferService } from '#services/CountMastersKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        countMastersKeyBuffer: CountMastersKeyBufferService;
    }
}

export default class CountMastersKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('countMastersKeyBuffer', async () => {
            const { CountMastersKeyBufferService } = await import('#services/CountMastersKeyBufferService');

            return new CountMastersKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
