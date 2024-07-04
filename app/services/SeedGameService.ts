import BaseGameService from '#services/BaseGameService';

export default class SeedGameService extends BaseGameService {
    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        request.headers.set('Telegram-Data', await this.getInitDataKey());
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'SEED';
    }

    protected getBotName(): string {
        return 'seed_coin_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://cf.seeddao.org';
    }

    protected getBaseUrl(): string {
        return 'https://elb.seeddao.org';
    }

    async login(): Promise<void> {
        await this.httpClient.get('api/v1/profile');
    }
}
