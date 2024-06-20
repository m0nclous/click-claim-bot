import { client } from '#config/telegram';
import { Api as TelegramApi } from 'telegram';
import { parseUrlHashParams } from '../../helpers/url.js';
import ky, { HTTPError, KyInstance } from 'ky';
import WebViewResultUrl = TelegramApi.WebViewResultUrl;
import TypeInputPeer = TelegramApi.TypeInputPeer;
import { NormalizedOptions } from '../../types/ky.js';
import logger from '@adonisjs/core/services/logger';

export interface HasTap {
    tap(quantity: number): Promise<void>;
}

export interface HasDailyReward {
    collectDaily(): Promise<void>
}

export interface HasEnergyRecharge {
    energyReset(): Promise<void>
}

export default abstract class BaseGameService {
    protected token: string | null = null;

    protected httpClient: KyInstance = this.makeHttpClient();

    public abstract getGameName(): string;

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
                'user-agent': 'Mozilla/5.0 (Linux; Android 13; 2107113SG Build/TKQ1.220829.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.148 Mobile Safari/537.36',
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
                    async (_request: Request, _options: NormalizedOptions, response: Response): Promise<void> => {
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
        if (!client.connected) {
            await client.connect();
        }

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
        const webView: WebViewResultUrl = await this.requestWebView();

        return parseUrlHashParams(webView.url);
    }

    public async getWebAppData(): Promise<string> {
        const webViewParams = await this.getWebViewParams();

        return webViewParams.tgWebAppData;
    }

    protected async getInitDataKey(): Promise<string> {
        return await this.getWebAppData();
    }

    public isAuthenticated(): boolean {
        return this.token !== null;
    }
}
