import { ApplicationService } from '@adonisjs/core/types';
import type { MergeKeyBufferService } from '#services/MergeKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mergeKeyBuffer: MergeKeyBufferService;
    }
}

export default class MergeKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('mergeKeyBuffer', async () => {
            const { MergeKeyBufferService } = await import('#services/MergeKeyBufferService');

            return new MergeKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
