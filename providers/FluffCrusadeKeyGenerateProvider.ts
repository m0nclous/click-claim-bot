import { ApplicationService } from '@adonisjs/core/types';
import { FluffCrusadeKeyGenerateService } from '#services/FluffCrusadeKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        fluffCrusadeKeyGenerate: FluffCrusadeKeyGenerateService;
    }
}

export default class FluffCrusadeKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('fluffCrusadeKeyGenerate', async () => {
            const { FluffCrusadeKeyGenerateService } = await import(
                '#services/FluffCrusadeKeyGenerateService'
            );

            return new FluffCrusadeKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
