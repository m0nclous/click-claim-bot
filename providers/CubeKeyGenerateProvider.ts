import { ApplicationService } from '@adonisjs/core/types';
import { CubeKeyGenerateService } from '#services/CubeKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        cubeKeyGenerate: CubeKeyGenerateService;
    }
}

export default class ClonesKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('cubeKeyGenerate', async () => {
            const { CubeKeyGenerateService } = await import('#services/CubeKeyGenerateService');

            return new CubeKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
