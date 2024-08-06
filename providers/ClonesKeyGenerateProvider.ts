import { ApplicationService } from '@adonisjs/core/types';
import { ClonesKeyGenerateService } from '#services/ClonesKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        clonesKeyGenerate: ClonesKeyGenerateService;
    }
}

export default class ClonesKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('clonesKeyGenerate', async () => {
            const clientId: string = crypto.randomUUID();

            const { ClonesKeyGenerateService } = await import('#services/ClonesKeyGenerateService');

            return new ClonesKeyGenerateService(clientId);
        });
    }
}
