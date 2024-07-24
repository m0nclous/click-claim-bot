import type { ApplicationService } from '@adonisjs/core/types';
import type TimeFarmGameService from '#services/TimeFarmGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        timeFarmGameService: TimeFarmGameService;
    }
}

const singletonById: Map<string, TimeFarmGameService> = new Map();

export default class TimeFarmGameProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async register(): Promise<void> {
        this.app.container.bind('timeFarmGameService', async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];
            const { default: TimeFarmGameService } = await import('#services/TimeFarmGameService');

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new TimeFarmGameService(userId));
            }

            return singletonById.get(userId) as TimeFarmGameService;
        });
    }
}
