import { ApplicationService } from '@adonisjs/core/types';
import type { InfectedFrontierKeyBufferService } from '#services/InfectedFrontierKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        infectedFrontierKeyBuffer: InfectedFrontierKeyBufferService;
    }
}

export default class InfectedFrontierKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('infectedFrontierKeyBuffer', async () => {
            const { InfectedFrontierKeyBufferService } = await import(
                '#services/InfectedFrontierKeyBufferService'
            );

            return new InfectedFrontierKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
