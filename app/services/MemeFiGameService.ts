import BaseGameService from '#services/BaseGameService';

export default class MemeFiGameService extends BaseGameService {
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
