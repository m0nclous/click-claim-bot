import BaseGameService from '#services/BaseGameService';
import { URLSearchParams } from 'node:url';

export interface IPass {
    type: string,
    price: number,
}

export interface ITask {
    description: string,
    type: string,
    count: number,
    params: string,
}

export interface IClickTask extends ITask{
    type: 'click',
    count: 2,
}

export interface IClockReward {
    value: number,
    type: string
}

export interface IClockProductionReward extends IClockReward {
    type: 'production_reward'
}

export interface IClockTelegramSubChannelReward extends IClockReward {
    type: 'telegram_sub_channel_reward'
}

export interface IClockTelegramSubGrouplReward extends IClockReward {
    type: 'telegram_sub_group_reward'
}

export interface IFactory {
    id: string,
    type: 'factory',
    name: string | null,
    status: 'working',
    payment_status: 'completed' | 'pending',
    creature: {
        id: string,
        name: string,
        template_id: string,
        item_ids: string[],
        factory_id: string | null,
        manufacturing_progress: number | null,
        mint_request_id: string | null,
        payment_status: 'completed' | 'pending',
    },
    current_task: IClickTask,
    production_cost: number,
    manufacturing_progress: number,
    total_tasks: number,
    completed_tasks: number,
    finish_at: string,
    telegram_group: string | null,
    telegram_group_boost: boolean | null,
    telegram_channel: string | null,
    telegram_channel_boost: boolean | null,
    redirect_url: string| null,
    accent_text_color: string| null,
    accent_background_color: string| null
}

export interface IBoot {
    referrals_count: number,
    available_slots: number,
    streak_days: number,
    burgers_count: number,
    destination_ton_wallet: string,
    factory_crafting_price_percent: number,
    share: {
        link: string,
        text: string,
        story_image: string,
        story_link: string,
        story_link_text: string,
        story_text: string,
    },
    queue: {
        total_size: number,
        current_position: number,
        friends_bonus: number,
    },
    factory_access_enabled: boolean,
    nft_craft_access_enabled: boolean,
    next_time_slot: number,
    streak_rewards: number[],
    mandatory_channels: string[],
    done_factories: string[],
    priority_factories: string[],
    passes: IPass[],
    active_passes: IPass[],
    onboarding_factory_completed: boolean,
    set_alarm_for_next_shift: boolean
}

export default class FartyBeetleGameService extends BaseGameService {
    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        request.headers.set('Authorization',  `Bearer ${await this.getInitDataKey()}`);
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'FartyBeetle';
    }

    protected getBotName(): string {
        return 'fart_beetle_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://factory.fireheadz.games';
    }

    protected getBaseUrl(): string {
        return 'https://factory.fireheadz.games';
    }

    public isAuthenticated(): boolean {
        return this.webView !== null;
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        await this.boot();
    }

    async boot(): Promise<IBoot> {
        return this.httpClient.post('api/boot/', {
            json: {
                timezone: 'Africa/Abidjan',
                timezone_offset: 0,
            },
        }).json();
    }

    async getFactories(): Promise<IFactory[]> {
        return this.httpClient.get('api/factory/', {
            searchParams: new URLSearchParams({
                locale: 'ru',
            }),
        }).json();
    }

    async clock(factoryId: IFactory['id'], task: ITask): Promise<(IClockProductionReward | IClockTelegramSubGrouplReward | IClockTelegramSubChannelReward)[]> {
        return this.httpClient.post(`api/factory/${factoryId}/clock`, {
            json: {
                task,
            },
        }).json();
    }
}
