import { ApplicationService } from '@adonisjs/core/types';
import { InfectedFrontierKeyGenerateService } from '#services/InfectedFrontierKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        infectedFrontierKeyGenerate: InfectedFrontierKeyGenerateService;
    }
}

export default class InfectedFrontierKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('infectedFrontierKeyGenerate', async () => {
            const { InfectedFrontierKeyGenerateService } = await import(
                '#services/InfectedFrontierKeyGenerateService'
            );

            return new InfectedFrontierKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
