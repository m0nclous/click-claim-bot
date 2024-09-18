import { ApplicationService } from '@adonisjs/core/types';
import { CountMastersKeyGenerateService } from '#services/CountMastersKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        countMastersKeyGenerate: CountMastersKeyGenerateService;
    }
}

export default class CountMastersGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('countMastersKeyGenerate', async () => {
            const { CountMastersKeyGenerateService } = await import(
                '#services/CountMastersKeyGenerateService'
            );

            return new CountMastersKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
