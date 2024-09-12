import { ApplicationService } from '@adonisjs/core/types';
import { BouncemastersKeyGenerateService } from '#services/BouncemastersKeyGenerateService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        bouncemastersKeyGenerate: BouncemastersKeyGenerateService;
    }
}

export default class BouncemastersGenerateProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('bouncemastersKeyGenerate', async () => {
            const { BouncemastersKeyGenerateService } = await import(
                '#services/BouncemastersKeyGenerateService'
            );

            return new BouncemastersKeyGenerateService(this.app, await this.app.container.make('logger'));
        });
    }
}
