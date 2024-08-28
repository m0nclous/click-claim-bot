import { ApplicationService } from '@adonisjs/core/types';
import { CafeDashKeyGenerateService } from '#services/CafeDashKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        cafeDashKeyGenerate: CafeDashKeyGenerateService;
    }
}

export default class CafeDashKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('cafeDashKeyGenerate', async () => {
            const clientId: string = crypto.randomUUID();

            const { CafeDashKeyGenerateService } = await import('#services/CafeDashKeyGenerateService');

            return new CafeDashKeyGenerateService(clientId);
        });
    }
}
