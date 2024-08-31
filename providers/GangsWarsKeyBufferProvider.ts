import { ApplicationService } from '@adonisjs/core/types';
import type { GangsWarsKeyBufferService } from '#services/GangsWarsKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        gangsWarsKeyBuffer: GangsWarsKeyBufferService;
    }
}

export default class GangsWarsKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('gangsWarsKeyBuffer', async () => {
            const { GangsWarsKeyBufferService } = await import('#services/GangsWarsKeyBufferService');

            return new GangsWarsKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
