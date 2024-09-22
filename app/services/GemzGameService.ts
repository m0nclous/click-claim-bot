import BaseGameService, { SessionExpiredError, TapError } from '#services/BaseGameService';
import randomString from '../../helpers/randomString.js';
import emitter from '@adonisjs/core/services/emitter';
import { sleep } from '#helpers/timer';
import logger from '@adonisjs/core/services/logger';
import { HTTPError } from 'ky';
import type { NormalizedOptions } from 'ky';
import type { HasDailyReward, HasEnergyRecharge, HasTap } from '#services/BaseGameService';
import type {
    ISessionExpiredErrorEvent,
    ISessionExpiredEvent,
    ITapErrorEvent,
    ITapEvent,
} from '#services/BaseClickBotService';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    interface EventsList {
        'gemz:tap': ITapEvent;
        'gemz:tap:error': ITapErrorEvent<IReplicationError>;
        'gemz:session-expired:error': ISessionExpiredErrorEvent<IReplicationError>;
    }
}

export interface IReplicationError {
    message: string;
    code: 'replication_error';
    subCode: 'replication_error';
}

export default class GemzGameService
    extends BaseGameService
    implements HasTap, HasDailyReward, HasEnergyRecharge
{
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

                        json.sid = this.sid;
                        json.id = this.userId.toString();
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
                        const json: any = await new Response(response.clone().body).json().catch(() => ({}));

                        if (json?.data?.token) {
                            this.token = json.data.token;
                        }

                        if (json?.data?.rev) {
                            this.rev = json.data.rev;
                        }
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'Gemz';
    }

    protected getBotName(): string {
        return 'gemzcoin_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://ff.notgemz.gemz.fun';
    }

    protected getBaseUrl(): string {
        return 'https://gemzcoin.us-east-1.replicant.gc-internal.net/gemzcoin/v3.6.5';
    }

    protected async getInitDataKey(): Promise<string> {
        const webAppData = await this.getWebAppData();

        const webAppDataParams = new URLSearchParams(webAppData);
        webAppDataParams.sort();

        return webAppDataParams.toString().replaceAll('+', '%20').replaceAll('&', '\n');
    }

    protected async getAuthKey(): Promise<string> {
        return this.isAuthenticated() ? (this.token as string) : this.getInitDataKey();
    }

    public async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        await this.getUserInfo();
    }

    public async logout(): Promise<void> {
        this.token = null;
        this.webView = null;
        this.rev = null;
    }

    public async getUserInfo(): Promise<any> {
        return await this.httpClient.post('loginOrCreate').json();
    }

    public async getTapQuantity(): Promise<number> {
        // На данный момент запрашивать энергию можно только при входе в новую сессию
        await this.logout();

        const userInfo = await this.getUserInfo();

        return userInfo.data.state.energy;
    }

    public async tap(quantity: number = 1): Promise<void> {
        const replicateTaps = async () => this.replicate(this.generateTaps(quantity));

        try {
            await replicateTaps();
        } catch (error) {
            if (!(error instanceof HTTPError)) {
                throw error;
            }

            const response: IReplicationError | any = await error.response.json();

            let replicateError: boolean = true;
            let errorInstance:
                | TapError<ITapErrorEvent<ITapEvent>>
                | SessionExpiredError<ISessionExpiredErrorEvent<ISessionExpiredEvent>>;

            if (response.code === 'replication_error') {
                replicateError = await this.retryFunction('GAME_SERVICE_TAP_RETRY', replicateTaps);
                errorInstance = new TapError(response);

                if (replicateError) {
                    await emitter.emit<any>('gemz:tap:error', {
                        self: this,
                        userId: this.userId,
                        quantity,
                        error: errorInstance,
                    });

                    throw errorInstance;
                }
            }

            if (response.code === 'session_desync_error') {
                replicateError = await this.retryFunction('GAME_SERVICE_RE_LOGIN', this.reLogin.bind(this));
                errorInstance = new SessionExpiredError(response);

                if (replicateError) {
                    await emitter.emit<any>('gemz:session-expired:error', {
                        self: this,
                        userId: this.userId,
                        error: errorInstance,
                    });

                    throw errorInstance;
                }
            }
        }

        await emitter.emit('gemz:tap', {
            self: this,
            userId: this.userId,
            quantity,
        });
    }

    public async collectDaily(): Promise<void> {
        return this.replicate([
            {
                fn: 'claimDailyReward',
                async: false,
            },
        ]);
    }

    public async energyReset(): Promise<void> {
        return this.replicate([
            {
                fn: 'buyBuff',
                async: false,
                args: {
                    buff: 'FullEnergy',
                },
            },
        ]);
    }

    public generateTaps(quantity: number = 1) {
        return [
            {
                fn: 'tap',
                async: false,
                meta: {
                    now: Date.now(),
                },
                times: quantity,
            },
        ];
    }

    protected async replicate(queue: object[]): Promise<any> {
        return this.httpClient
            .post('replicate', {
                json: {
                    ...this.defaultReplicateBody,
                    crqid: randomString(9).toLowerCase(),
                    queue: queue,
                },
            })
            .json<any>();
    }

    private async reLogin(): Promise<void> {
        await this.logout();
        return await this.login();
    }

    private async retryFunction(event: string, retryFunc: () => Promise<void>) {
        let replicateError: boolean = true;
        for (let attemptCount = 1; attemptCount < 4; attemptCount++) {
            logger.debug(
                {
                    userId: this.userId,
                    attemptCount,
                },
                `Gemz retry ${event}`,
            );

            await sleep(0.3 * Math.pow(2, attemptCount - 1) * 1000);
            replicateError = await retryFunc()
                .then(() => false)
                .catch(() => true);

            if (!replicateError) {
                break;
            }
        }

        return replicateError;
    }
}
