import BaseGameService from '#services/BaseGameService';

export default class CityHoldersGameService extends BaseGameService {
    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                afterResponse: [
                    async (_request, _options, response) => {
                        const json: any = await new Response(response.clone().body).json().catch(() => ({}));

                        if ('token' in json) {
                            this.token = json.token;
                        }
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'CityHolders';
    }

    protected getBotName(): string {
        return 'cityholderbot';
    }

    protected getWebViewUrl(): string {
        return 'https://app.city-holder.com';
    }

    protected getBaseUrl(): string {
        return 'https://api.city-holder.com';
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        await this.httpClient.post('auth', {
            json: {
                auth: await this.getInitDataKey(),
            },
        });
    }
}
