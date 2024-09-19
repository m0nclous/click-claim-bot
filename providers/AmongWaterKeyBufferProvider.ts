import { ApplicationService } from '@adonisjs/core/types';
import type { AmongWaterKeyBufferService } from '#services/AmongWaterKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        amongWaterKeyBuffer: AmongWaterKeyBufferService;
    }
}

export default class AmongWaterKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('amongWaterKeyBuffer', async () => {
            const { AmongWaterKeyBufferService } = await import('#services/AmongWaterKeyBufferService');

            return new AmongWaterKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
