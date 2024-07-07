import BaseGameService, { HasTap } from '#services/BaseGameService';

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

    async tap(quantity: number): Promise<void> {
        const operationName: string = 'MutationGameProcessTapsBatch';

        const variables = {
            payload: {
                nonce: '5550cdcd8d28719350c83c467d6c7eec904c3b26ac20f314461434a3691b94a5',
                tapsCount: quantity,
                vector: '2,2,2,2',
            },
        };

        const query =
            'mutation MutationGameProcessTapsBatch($payload: TelegramGameTapsBatchInput!) {\n  telegramGameProcessTapsBatch(payload: $payload) {\n    ...FragmentBossFightConfig\n    __typename\n  }\n}\n\nfragment FragmentBossFightConfig on TelegramGameConfigOutput {\n  _id\n  coinsAmount\n  currentEnergy\n  maxEnergy\n  weaponLevel\n  zonesCount\n  tapsReward\n  energyLimitLevel\n  energyRechargeLevel\n  tapBotLevel\n  currentBoss {\n    _id\n    level\n    currentHealth\n    maxHealth\n    __typename\n  }\n  freeBoosts {\n    _id\n    currentTurboAmount\n    maxTurboAmount\n    turboLastActivatedAt\n    turboAmountLastRechargeDate\n    currentRefillEnergyAmount\n    maxRefillEnergyAmount\n    refillEnergyLastActivatedAt\n    refillEnergyAmountLastRechargeDate\n    __typename\n  }\n  bonusLeaderDamageEndAt\n  bonusLeaderDamageStartAt\n  bonusLeaderDamageMultiplier\n  nonce\n  __typename\n}';

        await this.graphql(operationName, variables, query);
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
