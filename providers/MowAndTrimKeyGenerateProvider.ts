import { ApplicationService } from '@adonisjs/core/types';
import { MowAndTrimKeyGenerateService } from '#services/MowAndTrimKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mowAndTrimKeyGenerate: MowAndTrimKeyGenerateService;
    }
}

export default class ClonesKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('mowAndTrimKeyGenerate', async () => {
            const clientId: string = crypto.randomUUID();

            const { MowAndTrimKeyGenerateService } = await import('#services/MowAndTrimKeyGenerateService');

            return new MowAndTrimKeyGenerateService(clientId);
        });
    }
}
