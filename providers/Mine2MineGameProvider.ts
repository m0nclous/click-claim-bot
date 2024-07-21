import type { ApplicationService } from '@adonisjs/core/types';
import Mine2MineGameService from '#services/Mine2MineGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mine2MineGameService: Mine2MineGameService;
    }
}

const singletonById: Map<string, Mine2MineGameService> = new Map();

export default class Mine2MineGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('mine2MineGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: Mine2MineGameService } = await import('#services/Mine2MineGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new Mine2MineGameService(userId));
            }

            return singletonById.get(userId) as Mine2MineGameService;
        });
    }
}
