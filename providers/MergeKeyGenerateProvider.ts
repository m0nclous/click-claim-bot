import { ApplicationService } from '@adonisjs/core/types';
import { MergeKeyGenerateService } from '#services/MergeKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mergeKeyGenerate: MergeKeyGenerateService;
    }
}

export default class MergeKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('mergeKeyGenerate', async () => {
            const clientId: string = crypto.randomUUID();

            const { MergeKeyGenerateService } = await import('#services/MergeKeyGenerateService');

            return new MergeKeyGenerateService(clientId);
        });
    }
}
