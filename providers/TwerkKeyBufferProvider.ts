import { ApplicationService } from '@adonisjs/core/types';
import type { TwerkKeyBufferService } from '#services/TwerkKeyBufferService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        twerkKeyBuffer: TwerkKeyBufferService;
    }
}

export default class TwerkKeyBufferProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('twerkKeyBuffer', async () => {
            const { TwerkKeyBufferService } = await import('#services/TwerkKeyBufferService');

            return new TwerkKeyBufferService(this.app, await this.app.container.make('redis'));
        });
    }
}
