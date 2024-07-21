import { ApplicationService, ContainerBindings } from '@adonisjs/core/types';
import ZavodGameService from '#services/ZavodGameService';
import GemzGameService from '#services/GemzGameService';

export interface HasServiceToken<SERVICE> {
    serviceToken: keyof ContainerBindings;
    new (userId: number): SERVICE;
}

type GenericTypes = ZavodGameService | GemzGameService;

export default class GameProvider {
    constructor(protected app: ApplicationService) {}

    public async register<GameService extends GenericTypes>(
        serviceInstance: HasServiceToken<GameService>,
    ): Promise<void> {
        const singletonById: Map<string, GameService> = new Map();

        this.app.container.bind(serviceInstance.serviceToken, async (_resolver, runtimeValues) => {
            if (!runtimeValues) {
                throw new Error('runtimeValues must be defined');
            }

            const userId = runtimeValues[0];

            if (!singletonById.has(userId)) {
                singletonById.set(userId, new serviceInstance(userId));
            }

            return singletonById.get(userId) as GameService;
        });
    }
}
