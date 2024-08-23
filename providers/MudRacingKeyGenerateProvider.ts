import { ApplicationService } from '@adonisjs/core/types';
import { MudRacingKeyGenerateService } from '#services/MudRacingKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mudRacingKeyGenerate: MudRacingKeyGenerateService;
    }
}

export default class ClonesKeyGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('mudRacingKeyGenerate', async () => {
            const clientId: string = crypto.randomUUID();

            const { MudRacingKeyGenerateService } = await import('#services/MudRacingKeyGenerateService');

            return new MudRacingKeyGenerateService(clientId);
        });
    }
}
