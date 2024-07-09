import BaseGameService, { HasClaim } from '#services/BaseGameService';
import logger from '@adonisjs/core/services/logger';

interface IProfile {
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

interface IFarm {
    id: number;
    userTelegramId: string;
    tokensPerHour: number;
    claimInterval: number;
    toolkitLevel: number;
    workbenchLevel: number;
    lastClaim: string;
}

export default class ZavodGameService extends BaseGameService implements HasClaim {
    public profile: IProfile = {} as IProfile;
    public farm: IFarm = {} as IFarm;

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

    async claim(): Promise<void> {
        await this.httpClient.post('user/claim');
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
        const profileRes = await this.httpClient.get('user/profile');
        if (!profileRes.ok) return logger.error(profileRes);
        this.profile = await profileRes.json();

        const farmRes = await this.httpClient.get('user/farm');
        if (!farmRes.ok) return logger.error(farmRes);
        this.farm = await farmRes.json();
    }
}
