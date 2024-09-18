import { ApplicationService } from '@adonisjs/core/types';
import { PinOutMastersKeyGenerateService } from '#services/PinOutMastersKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        pinOutMastersKeyGenerate: PinOutMastersKeyGenerateService;
    }
}

export default class PinOutMastersGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('pinOutMastersKeyGenerate', async () => {
            const { PinOutMastersKeyGenerateService } = await import(
                '#services/PinOutMastersKeyGenerateService'
            );

            return new PinOutMastersKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
