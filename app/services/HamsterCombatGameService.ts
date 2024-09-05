import BaseGameService from '#services/BaseGameService';

export interface IAuthResponse {
    authToken: string;
    status: 'Ok';
}

export interface ISection {
    section: string;
    isAvailable: boolean;
}

export interface IDailyCombo {
    upgradeIds: IUpgrade['id'][];
    bonusCoins: number;
    isClaimed: boolean;
    remainSeconds: number;
}

export interface IUpgrade {
    id: string;
    name: string;
    price: number;
    profitPerHour: number;
    section: ISection['section'];
    level: number;
    currentProfitPerHour: number;
    profitPerHourDelta: number;
    isAvailable: boolean;
    isExpired: boolean;
    releaseAt: string;
    expiresAt: string;
    cooldownSeconds: number;
    totalCooldownSeconds: number;

    // TODO дописать доступные condition
    condition: null;
}

export interface IUpgradesForBuyResponse {
    upgradesForBuy: IUpgrade[];
    sections: ISection[];
    dailyCombo: IDailyCombo;
}

export default class HamsterCombatGameService extends BaseGameService {
    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        if (this.token) {
                            request.headers.set('Authorization', `Bearer ${this.token}`);
                        }
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'Hamster Combat';
    }

    protected getBotName(): string {
        return 'hamster_kombat_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://hamsterkombatgame.io';
    }

    protected getBaseUrl(): string {
        return 'https://api.hamsterkombatgame.io';
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        const initData = await this.getInitDataKey();
        this.token = await this.auth(initData);

        setTimeout(() => {
            this.token = null;
        }, 60_000 * 30);
    }

    async auth(tgInitData: string): Promise<string> {
        const responseData: IAuthResponse = await this.httpClient
            .post('auth/auth-by-telegram-webapp', {
                json: {
                    initDataRaw: tgInitData,
                },
            })
            .json();

        return responseData.authToken;
    }

    async getUpgradesForBuy(): Promise<IUpgradesForBuyResponse> {
        return this.httpClient.post('clicker/upgrades-for-buy').json();
    }

    async getUpgrades(): Promise<IUpgrade[]> {
        return this.getUpgradesForBuy().then((response) => response.upgradesForBuy);
    }

    async getBestUpgradeForBuy(): Promise<IUpgrade> {
        const upgrades: IUpgrade[] = (await this.getUpgrades()).filter(
            (upgrade: IUpgrade) =>
                upgrade.isAvailable &&
                !upgrade.isExpired &&
                upgrade.profitPerHourDelta > 0 &&
                upgrade.cooldownSeconds < 120,
        );

        return upgrades.sort((a, b) => a.price / a.profitPerHourDelta - b.price / b.profitPerHourDelta)[0];
    }
}
