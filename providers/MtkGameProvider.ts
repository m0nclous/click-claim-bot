import type { ApplicationService } from '@adonisjs/core/types';
import type MtkGameService from '#services/MtkGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mtkGameService: MtkGameService;
    }
}

const singletonById: Map<string, MtkGameService> = new Map();

export default class MtkGameClickBotProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('mtkGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: MtkGameService } = await import('#services/MtkGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new MtkGameService(userId));
            }

            return singletonById.get(userId) as MtkGameService;
        });
    }
}
