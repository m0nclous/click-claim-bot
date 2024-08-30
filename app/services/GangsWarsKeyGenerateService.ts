import { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export class GangsWarsKeyGenerateService extends BaseKeyGenerateService {
    public constructor(protected clientId: string) {
        super(clientId);
    }

    public getAppName(): string {
        return 'Gangs Wars';
    }

    protected getAppToken(): string {
        return 'b6de60a0-e030-48bb-a551-548372493523';
    }

    protected getPromoId(): string {
        return 'c7821fa7-6632-482c-9635-2bd5798585f9';
    }
    protected getEventType(): string {
        return '';
    }
}
