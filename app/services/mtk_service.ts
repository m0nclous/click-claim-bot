import ky, { KyInstance } from 'ky';
import telegramWebView from '#config/telegram-web-view';
import { Api, TelegramClient } from 'telegram';
import { urlParseHashParams } from '../../helpers/url.js';
import { TelegramService } from '#services/TelegramService';
import app from '@adonisjs/core/services/app';

interface GetUserInfo {
    lang: string;
    lastCollectionTime: number;
    totalEnergyLevel: number;
    leagueLevel: number;
    clickUpgradePrice: number;
    username: string;
    mtkBalance: number;
    totalClickPower: number;
    clickLevel: number;
    country: string;
    lastDailyCollectionTime: number;
    energyResets: number;
    name: string;
    mtkPerHour: number;
    referralId: number;
    dailyPrizeCollectAvailable: boolean;
    ipAddress: string;
    created_at: string;
    isReferralsSynced: boolean;
    _id: number;
    lastEnergyResetCollectionTime: number;
    showTutorial: boolean;
    totalClicks: number;
    dailyPrizeDay: number;
    energyLevel: number;
    lastUpgradePrice: number;
    isDatabaseSynced: boolean;
    telegramId: number;
    clickMultiplierLevel: number;
    tasks: string;
    energyUpgradePrice: number;
    isPremium: boolean;
    isTutorialPassed: boolean;
    userAgent: string;
    lastEnergyCollectionTime: number;
    updated_at: number;
    lastCollectedProfit: number;
    currentEnergy: number;
    mtkBalanceBeforeUpdate: number;
    businessLevels: string;
    token: string;
    timeToDailyReset: number;
}

interface UserClick {
    mtkBalance: number;
}

/**
 * @deprecated
 */
export default class MtkService {
    public baseUrl: string = 'https://clicker-api.fanschain.io';

    public token: string = '';

    public userInfo: GetUserInfo | undefined;

    public defaultHeaders: {
        [key: string]: string;
    } = {
        'x-requested-with': 'org.telegram.messenger',
        'user-agent':
            'Mozilla/5.0 (Linux; Android 13; 2107113SG Build/TKQ1.220829.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.148 Mobile Safari/537.36',
        'origin': 'https://clicker.fanschain.io',
        'referer': 'https://clicker.fanschain.io/',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-ua': '"Android WebView";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua-mobile': '?1',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'priority': 'u=1, i',
    };

    protected telegramWebViewParams:
        | {
              [key: string]: string;
          }
        | undefined;

    protected config;

    protected httpClient: KyInstance;

    public constructor(public userId: number) {
        this.config = telegramWebView['mtk'];
        this.httpClient = this.makeHttpClient();
    }

    protected makeHttpClient() {
        return ky.extend({
            prefixUrl: this.baseUrl,

            hooks: {
                beforeRequest: [
                    async (request) => {
                        for (const key in this.defaultHeaders) {
                            request.headers.set(key, this.defaultHeaders[key]);
                        }
                    },

                    async (request) => {
                        if (this.token) {
                            request.headers.set('Authorization', this.token);
                        }
                    },
                ],
            },
        });
    }

    protected async getTelegramWebViewParams() {
        const telegram: TelegramService = await app.container.make('telegram', [this.userId]);
        const client: TelegramClient = await telegram.getClient();

        const result = await client.invoke(
            new Api.messages.RequestWebView({
                peer: await client.getInputEntity(this.config.entity),
                bot: await client.getInputEntity(this.config.entity),
                url: this.config.webViewUrl,
                platform: 'android',
            }),
        );

        return urlParseHashParams(result.url);
    }

    public getTelegramInitData(): string {
        if (!this.telegramWebViewParams) {
            throw new Error('TelegramWebViewParams not loaded');
        }

        return btoa(`"${this.telegramWebViewParams.tgWebAppData}"`);
    }

    public async getUserInfo(): Promise<GetUserInfo> {
        if (!this.telegramWebViewParams) {
            this.telegramWebViewParams = await this.getTelegramWebViewParams();
        }

        const searchParams = new URLSearchParams();
        searchParams.set('telegramId', `${this.userId}`);
        searchParams.set('initData', this.getTelegramInitData());

        this.userInfo = (await this.httpClient
            .get('api/user/info', {
                searchParams,
            })
            .json()) as GetUserInfo;

        this.token = this.userInfo.token;

        return this.userInfo;
    }

    public async click(amount: number): Promise<UserClick> {
        if (!this.token) {
            throw new Error('Clicker token not found');
        }

        const searchParams = new URLSearchParams();
        searchParams.set('amount', `${amount}`);

        return await this.httpClient
            .post('api/user/click', {
                searchParams,
            })
            .json();
    }

    public async claim() {
        if (!this.userInfo) {
            throw new Error('User info not found');
        }

        if (this.getCurrentEnergy() !== this.getMaxEnergy()) {
            return;
        }

        await this.click(this.getCurrentEnergy());

        return true;
    }

    public async collectDaily() {
        if (!this.token) {
            throw new Error('Clicker token not found');
        }

        const searchParams = new URLSearchParams();
        searchParams.set('userId', `${this.userId}`);

        return await this.httpClient
            .post('api/user/collectDaily', {
                searchParams,
            })
            .json();
    }

    public async energyReset() {
        if (!this.token) {
            throw new Error('Clicker token not found');
        }

        const searchParams = new URLSearchParams();
        searchParams.set('userId', `${this.userId}`);

        return await this.httpClient
            .post('api/user/resetEnergy', {
                searchParams,
            })
            .json();
    }

    public getMaxEnergy() {
        if (!this.userInfo) {
            throw new Error('User info not found');
        }

        return this.userInfo.energyLevel * 250 + 2500;
    }

    public getCurrentEnergy() {
        if (!this.userInfo) {
            throw new Error('User info not found');
        }

        return this.userInfo.currentEnergy;
    }
}
