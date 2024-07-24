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
        return 'https://timefarm.app';
    }

    protected getBaseUrl(): string {
        return 'https://tg-bot-tap.laborx.io';
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        await this.httpClient.post('api/v1/auth/validate-init/v2', {
            json: {
                initData: await this.getInitDataKey(),
                platform: 'android',
            },
        });
    }
}
