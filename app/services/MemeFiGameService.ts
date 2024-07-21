import BaseGameService from '#services/BaseGameService';
import randomString from '#helpers/randomString';
import type { HasTap } from '#services/BaseGameService';
import { randomInt } from 'node:crypto';
import type { ITapEvent } from '#services/BaseClickBotService';
import emitter from '@adonisjs/core/services/emitter';

export interface ITapMeta {
    vector: string;
}

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    interface EventsList {
        'memeFi:tap': ITapEvent;
    }
}

export default class MemeFiGameService extends BaseGameService implements HasTap {
    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        if (this.isAuthenticated()) {
                            request.headers.set('Authorization', `Bearer ${this.token}`);
                        }
                    },
                ],

                afterResponse: [
                    async (_request, _options, response) => {
                        const json: any = await new Response(response.clone().body).json().catch(() => ({}));

                        if (json?.data?.telegramUserLogin?.access_token) {
                            this.token = json.data.telegramUserLogin.access_token;
                        }
                    },
                ],
            },
        });
    }

    async tap(quantity: number, meta?: ITapMeta): Promise<void> {
        const operationName: string = 'MutationGameProcessTapsBatch';

        const vector: string =
            meta?.vector ??
            Array.from(
                {
                    length: quantity,
                },
                () => randomInt(1, 5),
            ).join(',');

        const variables = {
            payload: {
                nonce: randomString(64),
                tapsCount: quantity,
                vector,
            },
        };

        const query: string = `
            mutation MutationGameProcessTapsBatch($payload: TelegramGameTapsBatchInput!) {
                telegramGameProcessTapsBatch(payload: $payload) {
                    ...FragmentBossFightConfig
                    __typename
                }
            }

            fragment FragmentBossFightConfig on TelegramGameConfigOutput {
                _id
                coinsAmount
                currentEnergy
                maxEnergy
                weaponLevel
                zonesCount
                tapsReward
                energyLimitLevel
                energyRechargeLevel
                tapBotLevel
                currentBoss {
                    _id
                    level
                    currentHealth
                    maxHealth
                    __typename
                }
                freeBoosts {
                    _id
                    currentTurboAmount
                    maxTurboAmount
                    turboLastActivatedAt
                    turboAmountLastRechargeDate
                    currentRefillEnergyAmount
                    maxRefillEnergyAmount
                    refillEnergyLastActivatedAt
                    refillEnergyAmountLastRechargeDate
                    __typename
                }
                bonusLeaderDamageEndAt
                bonusLeaderDamageStartAt
                bonusLeaderDamageMultiplier
                nonce
                __typename
            }
        `;

        await this.graphql(operationName, variables, query);

        await emitter.emit('memeFi:tap', {
            self: this,
            userId: this.userId,
            quantity,
        });
    }

    public async getTapQuantity(): Promise<number> {
        const operationName: string = 'QUERY_GAME_CONFIG';
        const variables = {};

        const query: string = `
            query QUERY_GAME_CONFIG {
                telegramGameGetConfig {
                    currentEnergy
                    weaponLevel
                }
            }
        `;

        const queryResult = await this.graphql(operationName, variables, query);
        const energyPerTap = queryResult.data.telegramGameGetConfig.weaponLevel + 1;
        const currentEnergy = queryResult.data.telegramGameGetConfig.currentEnergy;

        return Math.floor(currentEnergy / energyPerTap);
    }

    public getGameName(): string {
        return 'MemeFi';
    }

    protected getBotName(): string {
        return 'memefi_coin_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://tg-app.memefi.club';
    }

    protected getBaseUrl(): string {
        return 'https://api-gw-tg.memefi.club';
    }

    protected async graphql(operationName: string, variables: any, query: string): Promise<any> {
        return this.httpClient
            .post('graphql', {
                json: {
                    operationName,
                    variables,
                    query,
                },
            })
            .json();
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        const operationName: string = 'MutationTelegramUserLogin';

        const query: string = `mutation MutationTelegramUserLogin($webAppData: TelegramWebAppDataInput!) {
            telegramUserLogin(webAppData: $webAppData) {
                access_token
                __typename
            }
        }`;

        const web = await this.getWebViewParams();
        const params = await this.getWebAppData(true);

        const variables: object = {
            webAppData: {
                auth_date: parseInt(params.auth_date),
                hash: params.hash,
                query_id: params.query_id,
                checkDataString: Object.keys(params)
                    .filter((key) => key !== 'hash')
                    .map(
                        (key) =>
                            // @ts-expect-error ошибка из-за неизвестных ключей key
                            `${key}=${typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key]}`,
                    )
                    .sort()
                    .join('\n'),
                user: {
                    ...params.user,
                    version: web.tgWebAppVersion,
                    platform: web.tgWebAppPlatform,
                },
            },
        };

        await this.graphql(operationName, variables, query);
    }
}
