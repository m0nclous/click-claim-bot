import BaseGameService, { HasClaim } from '#services/BaseGameService';
import logger from '@adonisjs/core/services/logger';
import { ContainerBindings } from '@adonisjs/core/types';

export interface IProfile {
    telegramId: string;
    username: string;
    tokens: number;
    burnedTokens: number;
    multiplier: number;
    refLink: string;
    invitedBy: number | null;
    lastAuth: string;
    claims: number;
    language: string;
    guildId: number | null;
    icon: string;
    timestamp: string;
    refSyncAttempts: number;
    serverTime: string;
}

export interface IFarm {
    id: number;
    userTelegramId: string;
    tokensPerHour: number;
    claimInterval: number;
    toolkitLevel: number;
    workbenchLevel: number;
    lastClaim: string;
}

export default class ZavodGameService extends BaseGameService implements HasClaim {
    public static serviceToken = 'zavodGameService' as keyof ContainerBindings;

    protected profile: IProfile | null = null;
    protected farm: IFarm | null = null;

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
        return 'Marswallet_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://zavod.mdaowallet.com';
    }

    protected getBaseUrl(): string {
        return 'https://zavod-api.mdaowallet.com';
    }

    async login(): Promise<void> {
        await this.getProfile();
        await this.getFarm();
    }

    async claim(): Promise<void> {
        await this.httpClient.post('user/claim');
    }

    async canClaim(): Promise<boolean> {
        if (this.farm && this.profile) {
            const claimStartedAt = await this.claimStartedAt();
            const claimFinishAt = await this.claimFinishAt();
            const claimInterval = await this.claimInterval();

            if (claimStartedAt && claimFinishAt) {
                if (claimFinishAt.getTime() + claimInterval < claimStartedAt.getTime()) {
                    return true;
                }
            }
        }
        return false;
    }

    async claimFinishAt(): Promise<Date | null> {
        const { lastClaim } = this.farm!;

        return new Date(lastClaim);
    }

    async claimInterval(): Promise<number> {
        return this.farm?.claimInterval || 0;
    }

    async claimStartedAt(): Promise<Date | null> {
        return this.syncedTimeNow(this.serverDeltaTime(this.profile!.serverTime));
    }

    private async getProfile() {
        const profileRes = await this.httpClient.get('user/profile');
        if (!profileRes.ok) return logger.error(profileRes);
        this.profile = await profileRes.json();
    }

    private async getFarm() {
        const farmRes = await this.httpClient.get('user/farm');
        if (!farmRes.ok) return logger.error(farmRes);
        this.farm = await farmRes.json();
    }

    private syncedTimeNow(delta: number) {
        if (!delta) {
            return new Date();
        }
        return new Date(Date.now() - delta);
    }

    private serverDeltaTime(serverTime: string) {
        return new Date().getTime() - new Date(serverTime ?? 0).getTime();
    }
}
