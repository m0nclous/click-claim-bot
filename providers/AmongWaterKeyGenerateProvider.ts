import { ApplicationService } from '@adonisjs/core/types';
import { AmongWaterKeyGenerateService } from '#services/AmongWaterKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        amongWaterKeyGenerate: AmongWaterKeyGenerateService;
    }
}

export default class AmongWaterKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('amongWaterKeyGenerate', async () => {
            const { AmongWaterKeyGenerateService } = await import('#services/AmongWaterKeyGenerateService');

            return new AmongWaterKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
