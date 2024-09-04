import { ApplicationService } from '@adonisjs/core/types';
import { TileTrioKeyGenerateService } from '#services/TileTrioKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        tileTrioKeyGenerate: TileTrioKeyGenerateService;
    }
}

export default class TileTrioGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('tileTrioKeyGenerate', async () => {
            const { TileTrioKeyGenerateService } = await import('#services/TileTrioKeyGenerateService');

            return new TileTrioKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
