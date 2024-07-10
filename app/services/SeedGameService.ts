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

    async getMarketEgg(
        eggType: Egg['egg_type'] | '' = '',
        sortByPrice: 'ASC' | 'DESC' = 'ASC',
        sortByUpdatedAt?: 'ASC' | 'DESC',
        page: number = 1,
    ): Promise<GetMarketResponse<Egg>> {
        return await this.httpClient.get('api/v1/market', {
            searchParams: {
                egg_type: eggType,
                sort_by_price: sortByPrice,
                sort_by_updated_at: sortByUpdatedAt ?? '',
                page,
            },
        }).json();
    }

    async getMarketWorm(
        wormType: Worm['worm_type'] | '' = '',
        sortByPrice: 'ASC' | 'DESC' = 'ASC',
        sortByUpdatedAt?: 'ASC' | 'DESC',
        page: number = 1,
    ): Promise<GetMarketResponse<Worm>> {
        return await this.httpClient.get('api/v1/market', {
            searchParams: {
                market_type: 'worm',
                worm_type: wormType,
                sort_by_price: sortByPrice,
                sort_by_updated_at: sortByUpdatedAt ?? '',
                page: page,
            },
        }).json();
    }

    async buyMarket(marketId: string): Promise<GetMarketResponse<Egg>> {
        return await this.httpClient.post('api/v1/market-item/buy', {
            json: {
                market_id: marketId,
            },
        }).json();
    }

    async sellMarketEgg(eggId: string, price: number): Promise<GetMarketResponse<Egg>> {
        return await this.httpClient.post('api/v1/market-item/add', {
            json: {
                egg_id: eggId,
                price,
            },
        }).json();
    }

    async sellMarketWorm(wormId: string, price: number): Promise<GetMarketResponse<Worm>> {
        return await this.httpClient.post('api/v1/market-item/add', {
            json: {
                worm_id: wormId,
                price,
            },
        }).json();
    }
}

export interface GetMarketResponse<T> {
    data: {
        total: number,
        page: number,
        page_size: number,
        items: T[],
    }
}

export interface Egg {
    id: string,
    egg_id: string,
    egg_type: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic',
    price_gross: number,
    price_net: number,
    fee: number,
    status: string,
    created_by: string,
    bought_by: string | null,
    created_at: string,
    updated_at: string,
}

export interface Worm {
    id: string,
    worm_id: string,
    worm_type: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic',
    price_gross: number,
    price_net: number,
    fee: number,
    status: string,
    created_by: string,
    bought_by: string | null,
    created_at: string,
    updated_at: string,
}
