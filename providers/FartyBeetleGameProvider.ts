import type { ApplicationService } from '@adonisjs/core/types';
import type FartyBeetleGameService from '#services/FartyBeetleGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        fartyBeetleGameService: FartyBeetleGameService;
    }
}

const singletonById: Map<string, FartyBeetleGameService> = new Map();

export default class FartyBeetleGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('fartyBeetleGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: FartyBeetleGameService } = await import('#services/FartyBeetleGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new FartyBeetleGameService(userId));
            }

            return singletonById.get(userId) as FartyBeetleGameService;
        });
    }
}
