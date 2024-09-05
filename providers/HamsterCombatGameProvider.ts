import type { ApplicationService } from '@adonisjs/core/types';
import type HamsterCombatGameService from '#services/HamsterCombatGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        hamsterCombatGameService: HamsterCombatGameService;
    }
}

const singletonById: Map<string, HamsterCombatGameService> = new Map();

export default class HamsterCombatGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('hamsterCombatGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: HamsterCombatGameService } = await import('#services/HamsterCombatGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new HamsterCombatGameService(userId));
            }

            return singletonById.get(userId) as HamsterCombatGameService;
        });
    }
}
