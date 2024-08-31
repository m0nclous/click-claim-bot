import { ApplicationService } from '@adonisjs/core/types';
import type { CubeKeyBufferService } from '#services/CubeKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        cubeKeyBuffer: CubeKeyBufferService;
    }
}

export default class CubeKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('cubeKeyBuffer', async () => {
            const { CubeKeyBufferService } = await import('#services/CubeKeyBufferService');

            return new CubeKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
