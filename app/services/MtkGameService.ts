import BaseGameService, { HasDailyReward, HasEnergyRecharge, HasTap } from '#services/BaseGameService';
import { NormalizedOptions } from '../../types/ky.js';
import { URLSearchParams } from 'node:url';

export default class MtkGameService
    extends BaseGameService
    implements HasTap, HasDailyReward, HasEnergyRecharge
{
    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        if (this.isAuthenticated()) {
                            request.headers.set('Authorization', this.token as string);
                        }
                    },

                    async (request: Request, options: NormalizedOptions) => {
                        const searchParams: URLSearchParams = options.searchParams ?? new URLSearchParams();
                        const url: URL = new URL(request.url);

                        searchParams.set('telegramId', this.userId.toString());
                        searchParams.set('userId', this.userId.toString());
                        searchParams.set('initData', await this.getInitDataKey());

                        url.search = searchParams.toString();

                        return new Request(url.toString(), request as RequestInit);
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
        return 'MTK';
    }

    protected getBotName(): string {
        return 'mtkbossbot';
    }

    protected getWebViewUrl(): string {
        return 'https://clicker.fanschain.io';
    }

    protected getBaseUrl(): string {
        return 'https://clicker-api.fanschain.io';
    }

    protected async getInitDataKey(): Promise<string> {
        const webAppData = await this.getWebAppData();

        return btoa(`"${webAppData}"`);
    }

    async login(): Promise<void> {
        await this.httpClient.get('api/user/info');
    }

    async tap(quantity: number = 1): Promise<any> {
        const searchParams = new URLSearchParams();
        searchParams.set('amount', quantity.toString());

        await this.httpClient.post('api/user/click', {
            searchParams,
        });
    }

    public async collectDaily(): Promise<void> {
        await this.httpClient.post('api/user/collectDaily');
    }

    public async energyReset(): Promise<void> {
        await this.httpClient.post('api/user/resetEnergy');
    }
}
