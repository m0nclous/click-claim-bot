import BaseGameService, { HasClaim } from '#services/BaseGameService';
import { sleep } from '#helpers/timer';

export interface IUserInfo {
    originalLanguage: string;
    language: string;
    onboardingCompleted: boolean;
    level: number;
    tonAddress: number;
}

export interface IFarmingInfo {
    balance?: string;
    activeFarmingStartedAt?: string;
    farmingDurationInSec: number;
    farmingReward: number;
}

export interface ILevelInfo {
    level: string;
    farmMultiplicator: number;
    farmDuration: number;
}

export interface IBalanceInfo {
    balance: number;
    referral: {
        availableBalance: number;
        claimedBalance: number;
    };
    autofarm: boolean;
}

export interface ILogin {
    token: string;
    info: IUserInfo;
    farmingInfo: IFarmingInfo;
    levelDescriptions: ILevelInfo[];
    balanceInfo: IBalanceInfo;
    dailyRewardInfo: null;
    serverTime: string;
}

export default class TimeFarmGameService extends BaseGameService implements HasClaim {
    public loginInfo: ILogin | null = null;
    public farmInfo: IFarmingInfo | null = null;

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

        await this.getLoginInfo();
    }

    async getLoginInfo(): Promise<ILogin> {
        if (this.loginInfo === null) {
            this.loginInfo = (await this.httpClient
                .post('api/v1/auth/validate-init/v2', {
                    json: {
                        initData: await this.getInitDataKey(),
                        platform: 'android',
                    },
                })
                .json()) as ILogin;

            setTimeout(() => {
                this.loginInfo = null;
            }, 60_000);
        }

        return this.loginInfo;
    }

    async getUserInfo(): Promise<IUserInfo> {
        const loginInfo = await this.getLoginInfo();

        return loginInfo.info;
    }

    async getFarmInfo(): Promise<IFarmingInfo> {
        if (!this.farmInfo) {
            this.farmInfo = (await this.httpClient.get('api/v1/farming/info').json()) as IFarmingInfo;

            setTimeout(() => {
                this.farmInfo = null;
            }, 10_000);
        }

        return this.farmInfo;
    }

    async startFarming(): Promise<void> {
        await this.httpClient.post('api/v1/farming/start');
    }

    async claim(): Promise<void> {
        await this.httpClient.post('api/v1/farming/finish');
        await sleep(500);
        await this.startFarming();
    }

    async canClaim(): Promise<boolean> {
        const claimFinishAt = await this.claimFinishAt();

        if (claimFinishAt === null) {
            return false;
        }

        return new Date() >= claimFinishAt;
    }

    async claimInterval(): Promise<number> {
        const userInfo = await this.getUserInfo();
        const levels = (await this.getLoginInfo()).levelDescriptions;
        const farmLevel = levels.find(
            (levelInfo: ILevelInfo) => parseInt(levelInfo.level) === userInfo.level,
        );

        if (farmLevel === undefined) {
            throw new Error('Не найден farmLevel');
        }

        return farmLevel.farmDuration * 1000;
    }

    async claimStartedAt(): Promise<Date | null> {
        const farmInfo = await this.getFarmInfo();

        if (!farmInfo.activeFarmingStartedAt) {
            return null;
        }

        return new Date(farmInfo.activeFarmingStartedAt);
    }

    async claimFinishAt(): Promise<Date | null> {
        const claimStartedAt = await this.claimStartedAt();
        if (claimStartedAt === null) {
            return null;
        }

        const claimInterval = await this.claimInterval();

        return new Date(claimStartedAt.getTime() + claimInterval);
    }
}
