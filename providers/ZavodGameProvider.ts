import ZavodGameService from '#services/ZavodGameService';
import type { ApplicationService } from '@adonisjs/core/types';
import GameProvider from '#providers/GameProvider';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    export interface ContainerBindings {
        zavodGameService: ZavodGameService;
    }
}

export default class ZavodGameProvider extends GameProvider {
    constructor(protected app: ApplicationService) {
        super(app);
    }

    public async register(): Promise<void> {
        return super.register<ZavodGameService>((await import('#services/ZavodGameService')).default);
    }
}
