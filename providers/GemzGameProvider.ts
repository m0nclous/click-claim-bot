import type { ApplicationService } from '@adonisjs/core/types';
import type GemzGameService from '#services/GemzGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        gemzGameService: GemzGameService;
    }
}

const singletonById: Map<string, GemzGameService> = new Map();

export default class GemzGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('gemzGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: GemzGameService } = await import('#services/GemzGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new GemzGameService(userId));
            }

            return singletonById.get(userId) as GemzGameService;
        });
    }
}
