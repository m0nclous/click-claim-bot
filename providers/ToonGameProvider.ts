import type { ApplicationService } from '@adonisjs/core/types';
import ToonGameService from '#services/ToonGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        toonGameService: ToonGameService;
    }
}

const singletonById: Map<string, ToonGameService> = new Map();

export default class ToonGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('toonGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: ToonGameService } = await import('#services/ToonGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new ToonGameService(userId));
            }

            return singletonById.get(userId) as ToonGameService;
        });
    }
}
