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
    craftGameAvailableAt: string;
    craftGameId: number;
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

export interface ICraftGamePart {
    id: number;
    type: string;
    price: number;
    icon: string;
}

export interface ICraftGamePartTrash extends ICraftGamePart {
    id: 1;
    type: 'TRASH';
}

export interface ICraftGamePartCooler extends ICraftGamePart {
    id: 2;
    type: 'COOLER';
}

export interface ICraftGamePartSpring extends ICraftGamePart {
    id: 3;
    type: 'SPRING';
}

export interface ICraftGamePartGear extends ICraftGamePart {
    id: 4;
    type: 'GEAR';
}

export interface ICraftGamePartBolt extends ICraftGamePart {
    id: 5;
    type: 'BOLT';
}

export interface ICraftGamePartScrew extends ICraftGamePart {
    id: 6;
    type: 'SCREW';
}

export interface ICraftGame {
    id: number;
    userTelegramId: string;
    level: number;
    board: ICraftGamePart['id'][];
    startTimestamp: string;
    gameOverTimestamp: string | null;
    seed: number;
    savedParts: ICraftGamePart['id'][];
    soldParts: ICraftGamePart['id'][];
    helmet2Active: boolean;
    parts: (
        | ICraftGamePartTrash
        | ICraftGamePartBolt
        | ICraftGamePartCooler
        | ICraftGamePartGear
        | ICraftGamePartScrew
        | ICraftGamePartSpring
    )[];
    baseMultiplier: number;
    comboMultiplier: number;
}

export interface ICraftGameFinish {
    action: 'SAVE' | 'SELL';
    selectedSells: ICraftGamePart['id'][];
}

export default class ZavodGameService extends BaseGameService implements HasClaim {
    public userProfile: IUserProfile | null = null;

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
        if (refresh || this.userProfile === null) {
            this.userProfile = (await this.httpClient.get('user/profile').json()) as IUserProfile;

            setTimeout(() => {
                this.userProfile = null;
            }, 10_000);
        }

        return this.userProfile;
    }

    async getUserFarm(refresh: boolean = false): Promise<IUserFarm> {
        if (refresh || this.userFarm === null) {
            this.userFarm = (await this.httpClient.get('user/farm').json()) as IUserFarm;

            setTimeout(() => {
                this.userFarm = null;
            }, 10_000);
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

    async canStartCraftGame(): Promise<boolean> {
        const userProfile: IUserProfile = await this.getUserProfile();
        const craftGameAvailableAt = new Date(userProfile.craftGameAvailableAt);

        return new Date() >= craftGameAvailableAt;
    }

    async getCraftGame(): Promise<ICraftGame> {
        return this.httpClient.get('craftGame').json();
    }

    async finishCraftGame(
        action: ICraftGameFinish['action'],
        cells: ICraftGameFinish['selectedSells'],
    ): Promise<ICraftGame> {
        return this.httpClient
            .post('craftGame/finishLevel', {
                json: {
                    action,
                    selectedSells: cells,
                },
            })
            .json();
    }

    public makeCraftGameBoard(board: ICraftGame['board'], seed: ICraftGame['seed']): ICraftGame['board'] {
        for (let i = 20; i > 0; i) {
            const step1 = 10_000 * Math.sin(seed);
            const step2 = step1 - Math.floor(step1);
            const step3 = Math.floor(step2 * i--);

            const tempItem = board[i];
            board[i] = board[step3];
            board[step3] = tempItem;

            seed++;
        }

        return board;
    }
}
