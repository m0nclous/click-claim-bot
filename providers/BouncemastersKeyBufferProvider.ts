import { ApplicationService } from '@adonisjs/core/types';
import type { BouncemastersKeyBufferService } from '#services/BouncemastersKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        bouncemastersKeyBuffer: BouncemastersKeyBufferService;
    }
}

export default class BouncemastersKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('bouncemastersKeyBuffer', async () => {
            const { BouncemastersKeyBufferService } = await import('#services/BouncemastersKeyBufferService');

            return new BouncemastersKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
