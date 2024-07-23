import BaseGameService, { HasClaim } from '#services/BaseGameService';

export interface IPersonage {
    id: number;
    role: string;
    seed: number;
    gender: string;
    updated_at: string;
    user_id: number;
    celeb: null;
    level: number;
    source_image: string;
    created_at: string;
    result_image: string;
}

export interface IWallet {
    current_speed: number;
    next_max_balance_price: number;
    next_speed: number;
    created_at: string;
    current_max_balance: number;
    speed_level: number;
    max_balance_level: number;
    balance: number;
    updated_at: string;
    user_id: number;
    next_max_balance: number;
    started_at: string;
    next_speed_price: number;
    notified_at: null;
    fill_date: string;
}

export interface IGems {
    balance: number;
    updated_at: string;
    user_id: number;
    created_at: string;
}

export interface ISafe {
    earning_balance: number;
    next_daily_rate: number;
    previous_day_deposit_reward: number;
    next_max_balance_price: number;
    created_at: string;
    current_max_balance: number;
    current_daily_rate: number;
    deposit_reward_calculated_at: string;
    max_balance_level: number;
    is_full: number;
    balance: number;
    updated_at: string;
    user_id: number;
    next_max_balance: number;
    total_deposit_reward: number;
    notified_at: string;
}

export interface IUser {
    role: string;
    referrer_id: number;
    gender: string;
    last_seen: string;
    created_at: string;
    referrer_type: number;
    notify: number;
    newsletter_sent_result: null;
    personages: IPersonage[];
    language_code: string;
    updated_at: string;
    last_checked_referrals_main: string;
    last_checked_referrals_invite: string;
    referrer_value: number;
    id: number;
    is_bot: number;
    first_name: string;
    newsletter_sent_id: null;
    geoip_country: string;
    wallet: IWallet;
    level: number;
    last_name: string;
    is_premium: number;
    gems: IGems;
    safe: ISafe;
    username: string;
    status: number;
}

export default class ToonGameService extends BaseGameService implements HasClaim {
    public user: IUser | null = null;

    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        const json: any = await request
                            .clone()
                            .json()
                            .catch(() => ({}));

                        json.initData = await this.getInitDataKey();

                        return new Request(request, {
                            body: JSON.stringify(json),
                        });
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'ToON';
    }

    protected getBotName(): string {
        return 'toon_nation_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://twa.photo-cdn.net';
    }

    protected getBaseUrl(): string {
        return 'https://b7zj6wf7falelnlhlz2r5y6r5e0zibdi.lambda-url.us-east-1.on.aws';
    }

    public isAuthenticated(): boolean {
        return this.webView !== null;
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        await this.getUser();
    }

    async getUser(refresh: boolean = false): Promise<IUser> {
        if (refresh || this.user === null) {
            const data: any = await this.httpClient
                .post('', {
                    json: {
                        action: 'user.get',
                    },
                })
                .json();

            this.user = data.user as IUser;

            setTimeout(() => {
                this.user = null;
            }, 10_000);
        }

        return this.user;
    }

    async getWallet(): Promise<IWallet> {
        return (await this.getUser()).wallet;
    }

    async canClaim(): Promise<boolean> {
        return true;
    }

    async claim(): Promise<void> {
        await this.httpClient.post('', {
            json: {
                action: 'wallet.save.balance',
            },
        });
    }

    async claimFinishAt(): Promise<Date | null> {
        const wallet: IWallet = await this.getWallet();

        return new Date(wallet.fill_date);
    }

    async claimInterval(): Promise<number> {
        return 1;
    }

    async claimStartedAt(): Promise<Date | null> {
        const wallet: IWallet = await this.getWallet();

        return new Date(wallet.started_at);
    }
}
