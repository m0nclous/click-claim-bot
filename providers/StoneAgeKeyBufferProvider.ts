import { ApplicationService } from '@adonisjs/core/types';
import type { StoneAgeKeyBufferService } from '#services/StoneAgeKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        stoneAgeKeyBuffer: StoneAgeKeyBufferService;
    }
}

export default class StoneAgeKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('stoneAgeKeyBuffer', async () => {
            const { StoneAgeKeyBufferService } = await import('#services/StoneAgeKeyBufferService');

            return new StoneAgeKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
