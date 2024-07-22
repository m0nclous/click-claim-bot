import type { ApplicationService } from '@adonisjs/core/types';
import type ZavodGameService from '#services/ZavodGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        zavodGameService: ZavodGameService;
    }
}

const singletonById: Map<string, ZavodGameService> = new Map();

export default class ZavodGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('zavodGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: ZavodGameService } = await import('#services/ZavodGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new ZavodGameService(userId));
            }

            return singletonById.get(userId) as ZavodGameService;
        });
    }
}
