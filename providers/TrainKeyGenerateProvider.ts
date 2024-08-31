import { ApplicationService } from '@adonisjs/core/types';
import { TrainKeyGenerateService } from '#services/TrainKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        trainKeyGenerate: TrainKeyGenerateService;
    }
}

export default class TrainKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('trainKeyGenerate', async () => {
            const { TrainKeyGenerateService } = await import('#services/TrainKeyGenerateService');

            return new TrainKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
