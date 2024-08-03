import type { ApplicationService } from '@adonisjs/core/types';
import CityHoldersGameService from '#services/CityHoldersGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        cityHoldersGameService: CityHoldersGameService;
    }
}

const singletonById: Map<string, CityHoldersGameService> = new Map();

export default class CityHoldersGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('cityHoldersGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: CityHoldersGameService } = await import('#services/CityHoldersGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new CityHoldersGameService(userId));
            }

            return singletonById.get(userId) as CityHoldersGameService;
        });
    }
}
