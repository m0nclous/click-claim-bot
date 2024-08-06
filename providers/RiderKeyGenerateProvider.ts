import { ApplicationService } from '@adonisjs/core/types';
import { RiderKeyGenerateService } from '#services/RiderKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        riderKeyGenerate: RiderKeyGenerateService;
    }
}

export default class ClonesKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('riderKeyGenerate', async () => {
            const clientId: string = crypto.randomUUID();

            const { RiderKeyGenerateService } = await import('#services/RiderKeyGenerateService');

            return new RiderKeyGenerateService(clientId);
        });
    }
}
