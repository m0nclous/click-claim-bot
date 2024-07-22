import BaseGameService, { HasClaim } from '#services/BaseGameService';

export interface IUserProfile {
    telegramId: string;
    username: string;
    tokens: number;
    burnedTokens: number;
    multiplier: number;
    refLink: string;
    invitedBy: string;
    lastAuth: string;
    claims: number;
    language: string;
    guildId: number;
    icon: string;
    timestamp: string;
    refSyncAttempts: number;
    achievements: null;
    serverTime: string;
}

export interface IUserFarm {
    id: number;
    userTelegramId: string;
    tokensPerHour: number;
    claimInterval: number;
    referralPayoutPercentage: number;
    toolkitLevel: number;
    workbenchLevel: number;
    helmetLevel: number;
    lastClaim: string;
}

export default class ZavodGameService extends BaseGameService implements HasClaim {
    public profile: any = null;

    public userFarm: IUserFarm | null = null;

    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        request.headers.set('telegram-init-data', await this.getInitDataKey());
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'ZAVOD';
    }

    protected getBotName(): string {
        return 'Mdaowalletbot';
    }

    protected getWebViewUrl(): string {
        return 'https://zavod.mdaowallet.com';
    }

    protected getBaseUrl(): string {
        return 'https://zavod-api.mdaowallet.com';
    }

    public isAuthenticated(): boolean {
        return this.webView !== null;
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        await this.getUserProfile();
    }

    async getUserProfile(refresh: boolean = false): Promise<IUserProfile> {
        if (refresh || this.profile === null) {
            this.profile = await this.httpClient.get('user/profile').json();
        }

        return this.profile;
    }

    async getUserFarm(refresh: boolean = false): Promise<IUserFarm> {
        if (refresh || this.userFarm === null) {
            this.userFarm = (await this.httpClient.get('user/farm').json()) as IUserFarm;
        }

        return this.userFarm;
    }

    async canClaim(): Promise<boolean> {
        const claimFinishAt = await this.claimFinishAt();

        if (claimFinishAt === null) {
            return false;
        }

        return new Date() >= claimFinishAt;
    }

    async claim(): Promise<void> {
        await this.httpClient.post('user/claim');
    }

    async claimFinishAt(): Promise<Date | null> {
        const claimStartedAt = await this.claimStartedAt();

        if (claimStartedAt === null) {
            return null;
        }

        const claimInterval = await this.claimInterval();

        return new Date(claimStartedAt.getTime() + claimInterval);
    }

    async claimInterval(): Promise<number> {
        const userFarm: IUserFarm = await this.getUserFarm();

        return userFarm.claimInterval;
    }

    async claimStartedAt(): Promise<Date | null> {
        const userFarm: IUserFarm = await this.getUserFarm();

        return new Date(userFarm.lastClaim);
    }
}
