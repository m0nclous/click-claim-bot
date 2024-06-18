import GameService from '#services/GameService';
import telegram from '#config/telegram';
import randomString from '../../helpers/randomString.js';
import { NormalizedOptions } from 'ky';

export default class GemzGameService extends GameService {
    protected rev: number | null = null;

    protected sid: string = randomString(9).toLowerCase();

    protected readonly defaultReplicateBody = {
        abTestsDynamicConfig: {
            '0002_invite_drawer': {
                active: true,
                rollOut: 1,
            },
            '0003_invite_url': {
                active: true,
                rollOut: 1,
            },
            '0004_invite_copy': {
                active: true,
                rollOut: 1,
            },
            '0010_localization': {
                active: true,
                rollOut: 1,
            },
            '0006_daily_reward': {
                active: true,
                rollOut: 1,
            },
            '0011_earn_page_buttons': {
                active: true,
                rollOut: 1,
            },
            '0005_invite_message': {
                active: true,
                rollOut: 1,
            },
            '0008_retention_with_points': {
                active: true,
                rollOut: 1,
            },
            '0018_earn_page_button_2_friends': {
                active: true,
                rollOut: 1,
            },
            '0012_rewards_summary': {
                active: true,
                rollOut: 1,
            },
            '0022_localization': {
                active: true,
                rollOut: 1,
            },
            '0023_earn_page_button_connect_wallet': {
                active: true,
                rollOut: 1,
            },
            '0016_throttling': {
                active: true,
                rollOut: 1,
            },
            '0024_rewards_summary2': {
                active: true,
                rollOut: 1,
            },
            '0016_throttling_v2': {
                active: true,
                rollOut: 1,
            },
            '0014_gift_airdrop': {
                active: true,
                rollOut: 1,
            },
        },

        requestedProfileIds: [],
        consistentFetchIds: [],
        clientRandomSeed: 0,
    };

    protected getBotName(): string {
        return 'gemzcoin_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://ff.notgemz.gemz.fun';
    }

    protected getBaseUrl(): string {
        return 'https://gemzcoin.us-east-1.replicant.gc-internal.net/gemzcoin/v2.18.0';
    }

    public constructor() {
        super();

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        const json: any = await request.clone().json().catch(() => ({}));

                        json.sid = this.sid;
                        json.id = telegram.api.userId.toString();
                        json.auth = await this.getAuthKey();

                        if (this.rev) {
                            json.rev = this.rev;
                        }

                        return new Request(request, {
                            body: JSON.stringify(json),
                        });
                    },
                ],

                afterResponse: [
                    async (_request: Request, _options: NormalizedOptions, response: Response) => {
                        const json: any = await new Response(response.clone().body).json();

                        if (json?.data.token) {
                            this.token = json.data.token;
                        }

                        if (json?.data.rev) {
                            this.rev = json.data.rev;
                        }
                    },
                ],
            },
        });
    }

    protected async getAuthKey(): Promise<string> {
        if (this.isAuthenticated()) {
            return this.token ?? '';
        }

        const webAppData = await this.getWebAppData();

        const webAppDataParams = new URLSearchParams(webAppData);
        webAppDataParams.sort();

        return webAppDataParams.toString().replaceAll('&', '\n');
    }

    public async login(): Promise<void> {
        await this.httpClient.post('loginOrCreate').json();
    }

    protected async replicate(queue: object[]): Promise<any> {
        return this.httpClient.post('replicate', {
            json: {
                ...this.defaultReplicateBody,
                crqid: randomString(9).toLowerCase(),
                queue,
            },
        }).json<any>();
    }

    public async heartbeat(): Promise<any> {
        return this.replicate([
            {
                fn: '_heartbeat',
                async: false,
                args: [],
            },
        ]);
    }

    public async tap(quantity: number = 1): Promise<any> {
        return this.replicate(this.generateTaps(quantity));
    }

    public generateTaps(quantity: number = 1) {
        const taps: {
            fn: 'tap',
            async: false,
            meta: {
                now: number,
            },
        }[] = [];

        for (let i = 0; i < quantity; i++) {
            taps.unshift({
                fn: 'tap',
                async: false,
                meta: {
                    now: Date.now(),
                },
            });
        }

        return taps;
    }
}