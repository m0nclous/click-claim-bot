import { ApplicationService } from '@adonisjs/core/types';
import { GangsWarsKeyGenerateService } from '#services/GangsWarsKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        gangsWarsKeyGenerate: GangsWarsKeyGenerateService;
    }
}

export default class GangsWarsKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('gangsWarsKeyGenerate', async () => {
            const clientId: string = crypto.randomUUID();

            const { GangsWarsKeyGenerateService } = await import('#services/GangsWarsKeyGenerateService');

            return new GangsWarsKeyGenerateService(clientId);
        });
    }
}
