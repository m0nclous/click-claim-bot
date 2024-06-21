import BaseGameService from '#services/BaseGameService';

export default class ZavodGameService extends BaseGameService {
    public constructor() {
        super();

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        request.headers.set('telegram-init-data', await this.getInitDataKey());
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'ZAVOD';
    }

    protected getBotName(): string {
        return 'Marswallet_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://zavod.mdaowallet.com';
    }

    protected getBaseUrl(): string {
        return 'https://zavod-api.mdaowallet.com';
    }

    async login(): Promise<void> {
        await this.httpClient.get('user/profile');
    }
}
