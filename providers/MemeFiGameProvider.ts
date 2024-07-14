import type { ApplicationService } from '@adonisjs/core/types';
import type MemeFiGameService from '#services/MemeFiGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        memeFiGameService: MemeFiGameService;
    }
}

const singletonById: Map<string, MemeFiGameService> = new Map();

export default class MemeFiGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('memeFiGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: MemeFiGameService } = await import('#services/MemeFiGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new MemeFiGameService(userId));
            }

            return singletonById.get(userId) as MemeFiGameService;
        });
    }
}
