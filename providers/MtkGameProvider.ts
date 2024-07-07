import { ApplicationService } from '@adonisjs/core/types';
import MtkGameService from '#services/MtkGameService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        mtkGameService: MtkGameService;
    }
}

const singletonById: Record<string, MtkGameService> = {};

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

            if (!singletonById[userId]) {
                singletonById[userId] = new MtkGameService(userId);
            }

            return singletonById[userId];
        });
    }
}
