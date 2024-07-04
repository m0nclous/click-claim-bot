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

    async getMarket(
        eggType: Egg['egg_type'] | '' = '',
        sortByPrice: 'ASC' | 'DESC' = 'ASC',
        sortByUpdatedAt: string = '',
        page: number = 1,
    ): Promise<GetMarketResponse> {
        return await this.httpClient.get('api/v1/market', {
            searchParams: {
                egg_type: eggType,
                sort_by_price: sortByPrice,
                sort_by_updated_at: sortByUpdatedAt,
                page: page,
            },
        }).json();
    }

    async buyMarket(marketId: string): Promise<GetMarketResponse> {
        return await this.httpClient.post('api/v1/market-item/buy', {
            json: {
                market_id: marketId,
            },
        }).json();
    }

    async sellMarket(eggId: string, price: number): Promise<GetMarketResponse> {
        return await this.httpClient.post('api/v1/market-item/add', {
            json: {
                egg_id: eggId,
                price,
            },
        }).json();
    }
}

export interface GetMarketResponse {
    data: {
        total: number,
        page: number,
        page_size: number,
        items: Egg[],
    }
}

export interface Egg {
    id: string,
    egg_id: string,
    egg_type: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic',
    egg_owner_id: string,
    price_gross: number,
    price_net: number,
    fee: number,
    status: string,
    created_by: string,
    bought_by: string | null,
    created_at: string,
    updated_at: string,
}
