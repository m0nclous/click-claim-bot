import { Api as TelegramApi, TelegramClient } from 'telegram';
import { parseUrlHashParams } from '#helpers/url';
import ky, { HTTPError, KyInstance } from 'ky';
import WebViewResultUrl = TelegramApi.WebViewResultUrl;
import TypeInputPeer = TelegramApi.TypeInputPeer;
import { NormalizedOptions } from '../../types/ky.js';
import logger from '@adonisjs/core/services/logger';
import { TgWebAppDataJson } from '../../types/telegram.js';
import type { TelegramService } from '#services/TelegramService';
import app from '@adonisjs/core/services/app';

export class TapError<T> extends Error {
    constructor(public data: T) {
        super('Ошибка отправки тапов');
    }
}

export interface HasTap<T = unknown> {
    /**
     * Отправить тапы
     *
     * @param quantity количество тапов
     * @throws TapError
     */
    tap(quantity: number, opts?: T): Promise<void>;
}

export interface TapUpgradable extends HasTap {
    getTapUpgradeCurrentLevel(): Promise<number>;

    getTapUpgradePrice(): Promise<number>;

    tapUpgrade(): Promise<void>;
}

export interface TapMultiplierUpgradable extends HasTap {
    getTapMultiplierUpgradeCurrentLevel(): Promise<number>;

    getTapMultiplierUpgradePrice(): Promise<number>;

    tapMultiplierUpgrade(): Promise<void>;
}

export interface HasDailyReward {
    collectDaily(): Promise<void>;
}

export interface HasEnergyRecharge {
    energyReset(): Promise<void>;
}

export interface EnergyUpgradable extends HasEnergyRecharge {
    getEnergyUpgradeCurrentLevel(): Promise<number>;

    getEnergyUpgradePrice(): Promise<number>;

    energyUpgrade(): Promise<void>;
}

export interface HasClaim {
    claim(): Promise<void>;
}

export default abstract class BaseGameService {
    protected token: string | null = null;

    protected webView: WebViewResultUrl | null = null;

    protected httpClient: KyInstance = this.makeHttpClient();

    protected constructor(public userId: number) {}

    public abstract getGameName(): string;

    public getWebViewTTL(): number {
        return 1_000 * 60 * 60;
    }

    protected abstract getBotName(): string;

    protected abstract getWebViewUrl(): string;

    protected abstract getBaseUrl(): string;

    public abstract login(): Promise<void>;

    protected makeHttpClient(): KyInstance {
        return ky.extend({
            prefixUrl: this.getBaseUrl(),

            headers: {
                'origin': this.getWebViewUrl(),
                'referer': this.getWebViewUrl() + '/',

                'x-requested-with': 'org.telegram.messenger',

                'accept': '*/*',
                'cache-control': 'no-cache',
                'pragma': 'no-cache',
                'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',

                'sec-ch-ua': '"Android WebView";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                'sec-ch-ua-platform': '"Android"',
                'sec-ch-ua-mobile': '?1',
                'sec-fetch-site': 'same-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'priority': 'u=1, i',
            },

            hooks: {
                beforeRequest: [
                    (request: Request): void => {
                        const { url, method } = request;

                        logger.trace(`Запрос -> [${method}] ${url}`);
                    },
                ],

                afterResponse: [
                    async (
                        _request: Request,
                        _options: NormalizedOptions,
                        response: Response,
                    ): Promise<void> => {
                        const { url, status } = response;
                        const json = await response.json().catch(() => null);

                        logger.trace(json, `Ответ <- [${status}] ${url}`);
                    },
                ],

                beforeError: [
                    (error: HTTPError): HTTPError => {
                        logger.error(error);

                        return error;
                    },
                ],
            },
        });
    }

    protected async requestWebView(): Promise<WebViewResultUrl> {
        const telegram: TelegramService = await app.container.make('telegram', [this.userId]);
        const client: TelegramClient = await telegram.getClient();
        await client.connect();

        const botEntity: TypeInputPeer = await client.getInputEntity(this.getBotName());

        return client.invoke(
            new TelegramApi.messages.RequestWebView({
                peer: botEntity,
                bot: botEntity,
                url: this.getWebViewUrl(),
                platform: 'android',
            }),
        );
    }

    public async getWebViewParams(): Promise<{ [key: string]: string }> {
        if (this.webView === null) {
            this.webView = await this.requestWebView();

            setTimeout(() => {
                this.webView = null;
            }, this.getWebViewTTL());
        }

        return parseUrlHashParams(this.webView.url);
    }

    public async getWebAppData(asObject?: false): Promise<string>;
    public async getWebAppData(asObject: true): Promise<TgWebAppDataJson>;
    public async getWebAppData(asObject: boolean = false): Promise<string | TgWebAppDataJson> {
        const webViewParams = await this.getWebViewParams();

        if (!asObject) {
            return webViewParams.tgWebAppData;
        }

        const tgWebAppDataUrlSearch = new URLSearchParams(webViewParams.tgWebAppData);
        const tgWebAppDataJson = Object.fromEntries(
            tgWebAppDataUrlSearch.entries(),
        ) as unknown as TgWebAppDataJson;
        tgWebAppDataJson.user = JSON.parse(tgWebAppDataJson.user as unknown as string);

        return tgWebAppDataJson;
    }

    protected async getInitDataKey(): Promise<string> {
        return await this.getWebAppData();
    }

    public isAuthenticated(): boolean {
        return this.token !== null && this.webView !== null;
    }
}
