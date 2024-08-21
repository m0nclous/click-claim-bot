import { Api as TelegramApi, TelegramClient } from 'telegram';
import { parseUrlHashParams } from '#helpers/url';
import ky from 'ky';
import WebViewResultUrl = TelegramApi.WebViewResultUrl;
import TypeInputPeer = TelegramApi.TypeInputPeer;
import logger from '@adonisjs/core/services/logger';
import app from '@adonisjs/core/services/app';

import type { KyInstance } from 'ky';
import type { NormalizedOptions } from '../../types/ky.js';
import type { TgWebAppDataJson } from '../../types/telegram.js';
import type { TelegramService } from '#services/TelegramService';

export class TapError<T> extends Error {
    constructor(public data: T) {
        super('Ошибка отправки тапов');
    }
}

export class SessionExpiredError<T> extends Error {
    constructor(public data: T) {
        super('Ошибка текущей сессии');
    }
}

export interface HasTap {
    /**
     * Послать в игру определенное количество тапов
     *
     * @param quantity Количество
     * @param meta Мета-информация
     * @throws TapError
     */
    tap(quantity: number, meta?: any): Promise<void>;

    /**
     * Количество доступных тапов для отправки
     */
    getTapQuantity(): Promise<number>;
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
    /**
     * Собрать награду
     */
    claim(): Promise<void>;

    /**
     * Можно ли собрать награду сейчас
     */
    canClaim(): Promise<boolean>;

    /**
     * Время в ms, сколько занимает полный claim от старта до финиша
     */
    claimInterval(): Promise<number>;

    /**
     * Дата, когда был начат процесс подготовки награды
     */
    claimStartedAt(): Promise<Date | null>;

    /**
     * Дата, когда ожидается завершение процесса подготовки награды
     */
    claimFinishAt(): Promise<Date | null>;
}

export default abstract class BaseGameService {
    protected token: string | null = null;

    protected webView: WebViewResultUrl | null = null;

    protected httpClient: KyInstance = this.makeHttpClient();

    public constructor(public userId: number) {}

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
            referrer: this.getWebViewUrl() + '/',
            referrerPolicy: 'strict-origin-when-cross-origin',
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'x-requested-with': 'org.telegram.messenger',

                'accept': '*/*',
                'cache-control': 'no-cache',
                'pragma': 'no-cache',
                'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',

                'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Android WebView";v="126"',
                'sec-ch-ua-platform': '"Android"',
                'sec-ch-ua-mobile': '?1',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'priority': 'u=1, i',
            },

            hooks: {
                afterResponse: [
                    async (
                        request: Request,
                        options: NormalizedOptions,
                        response: Response,
                    ): Promise<void> => {
                        response = response.clone();
                        request = request.clone();

                        const urlInstance = new URL(request.url);

                        logger.use('gameServiceRequest').trace(
                            {
                                userId: this.userId,
                                request: {
                                    method: request.method,
                                    url: `${urlInstance.protocol}//${urlInstance.host}${urlInstance.pathname}`,
                                    search: Object.fromEntries(options.searchParams?.entries() ?? []),
                                    headers: Object.fromEntries(request.headers),
                                    json: await request.json().catch(() => null),
                                },
                                response: {
                                    status: response.status,
                                    headers: Object.fromEntries(response.headers),
                                    json: await response.json().catch(() => null),
                                },
                            },
                            `Game HTTP Request - ${this.getGameName()}`,
                        );
                    },
                ],
            },
        });
    }

    protected async requestWebView(): Promise<WebViewResultUrl> {
        const telegram: TelegramService = await app.container.make('telegram', [this.userId]);
        const client: TelegramClient = await telegram.getClient();

        if (!client.connected) {
            await client.connect();
        }

        const botEntity: TypeInputPeer = await client.getInputEntity(this.getBotName());

        return client.invoke(
            new TelegramApi.messages.RequestWebView({
                peer: botEntity,
                bot: botEntity,
                url: this.getWebViewUrl(),
                platform: 'Android',
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
