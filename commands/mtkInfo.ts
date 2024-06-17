import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import { client } from '#config/telegram-api';
import { Api } from 'telegram';
import telegramWebView from '#config/telegram-web-view';

export default class MtkInfo extends BaseCommand {
    static commandName = 'mtk:info';
    static description = 'Показать информацию в игре $MTK Clicker Mafia';

    static options: CommandOptions = {};

    async run() {
        if (!client.connected) {
            await client.connect();
        }

        const result = await getWebViewInitData('mtk');

        console.log(result);

        async function getWebViewInitData(bot: string) {
            const botConfig = telegramWebView[bot];

            const result = await client.invoke(
                new Api.messages.RequestWebView({
                    peer: await client.getInputEntity(botConfig.entity),
                    bot: await client.getInputEntity(botConfig.entity),
                    url: botConfig.webViewUrl,
                    platform: 'android',
                }),
            );

            console.log(urlParseHashParams(result.url));

            return botConfig.telegramInitData(urlParseHashParams(result.url).tgWebAppData);
        }

        function urlParseHashParams(url: string): {
            [key: string]: string
        } {
            let locationHash = new URL(url).hash.replace(/^#/, '');
            const params = {};

            if (!locationHash.length) {
                return params;
            }

            if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
                params._path = urlSafeDecode(locationHash);
                return params;
            }

            const qIndex = locationHash.indexOf('?');
            if (qIndex >= 0) {
                const pathParam = locationHash.substr(0, qIndex);
                params._path = urlSafeDecode(pathParam);
                locationHash = locationHash.substr(qIndex + 1);
            }

            const query_params = urlParseQueryString(locationHash);
            for (const k in query_params) {
                params[k] = query_params[k];
            }

            return params;
        }

        function urlParseQueryString(queryString: string): {
            [key: string]: string
        } {
            const params = {};
            if (!queryString.length) {
                return params;
            }

            const queryStringParams = queryString.split('&');
            let i, param, paramName, paramValue;

            for (i = 0; i < queryStringParams.length; i++) {
                param = queryStringParams[i].split('=');
                paramName = urlSafeDecode(param[0]);
                paramValue = param[1] == null ? null : urlSafeDecode(param[1]);
                params[paramName] = paramValue;
            }
            return params;
        }

        function urlSafeDecode(urlencoded: string): string {
            try {
                urlencoded = urlencoded.replace(/\+/g, '%20');
                return decodeURIComponent(urlencoded);
            } catch (e) {
                return urlencoded;
            }
        }
    }
}
