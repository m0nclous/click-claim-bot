import { ApplicationService } from '@adonisjs/core/types';
import { StoneAgeKeyGenerateService } from '#services/StoneAgeKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        stoneAgeKeyGenerate: StoneAgeKeyGenerateService;
    }
}

export default class StoneAgeKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('stoneAgeKeyGenerate', async () => {
            const { StoneAgeKeyGenerateService } = await import('#services/StoneAgeKeyGenerateService');

            return new StoneAgeKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
