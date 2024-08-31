import { ApplicationService } from '@adonisjs/core/types';
import type { TrainKeyBufferService } from '#services/TrainKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        trainKeyBuffer: TrainKeyBufferService;
    }
}

export default class TrainKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('trainKeyBuffer', async () => {
            const { TrainKeyBufferService } = await import('#services/TrainKeyBufferService');

            return new TrainKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
