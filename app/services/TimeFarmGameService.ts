import BaseGameService from '#services/BaseGameService';

export default class TimeFarmGameService extends BaseGameService {
    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        if (this.isAuthenticated()) {
                            request.headers.set('Authorization', `Bearer ${this.token as string}`);
                        }
                    },
                ],

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
        return 'Time Farm';
    }

    protected getBotName(): string {
        return 'TimeFarmCryptoBot';
    }

    protected getWebViewUrl(): string {
        return 'https://tg-tap-miniapp.laborx.io';
    }

    protected getBaseUrl(): string {
        return 'https://tg-bot-tap.laborx.io';
    }

    async login(): Promise<void> {
        await this.httpClient.post('api/v1/auth/validate-init', {
            body: await this.getInitDataKey(),
        });
    }
}
