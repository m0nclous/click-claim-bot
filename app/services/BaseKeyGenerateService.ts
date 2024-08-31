import ky, { HTTPError, Input, KyInstance, TimeoutError } from 'ky';
import type { NormalizedOptions } from '../../types/ky.js';
import logger from '@adonisjs/core/services/logger';
import { sleep } from '#helpers/timer';
import { UUID } from 'node:crypto';
import TooManyRegisterException from '#exceptions/TooManyRegisterException';
import type { ApplicationService, LoggerService } from '@adonisjs/core/types';
import { socksDispatcher } from 'fetch-socks';
import { getRandomLine } from '#helpers/file';
import { Agent } from 'undici';
import env from '#start/env';

export abstract class BaseKeyGenerateService {
    protected clientToken: string | null = null;

    protected httpClient: KyInstance = this.makeHttpClient();

    protected socksDispatcher: Agent | null = null;

    protected constructor(
        protected app: ApplicationService,
        protected logger: LoggerService,
        protected clientId: string = BaseKeyGenerateService.MakeUniqueClientId(),
    ) {
        if (env.get('KEY_GENERATE_USE_PROXY', false)) {
            const proxyLine = getRandomLine('proxy-list.txt');
            const [host, port] = proxyLine.split(':');

            this.socksDispatcher = socksDispatcher(
                {
                    type: 5,
                    host,
                    port: parseInt(port),

                    userId: env.get('KEY_GENERATE_PROXY_USER'),
                    password: env.get('KEY_GENERATE_PROXY_PASSWORD'),
                },
                {
                    connectTimeout: 30_000,
                },
            );
        }
    }

    public abstract getAppName(): string;

    protected abstract getAppToken(): string;

    protected abstract getPromoId(): string;

    protected abstract getEventType(): string;

    public static MakeUniqueClientId(): string {
        return crypto.randomUUID();
    }

    protected makeHttpClient(): KyInstance {
        return ky.extend({
            prefixUrl: 'https://api.gamepromo.io',
            timeout: 30_000,
            headers: {
                'Content-Type': 'application/json',
            },

            fetch: (input: Input, requestInit: RequestInit = {}) => {
                if (this.socksDispatcher) {
                    // @ts-expect-error проблема с типами
                    requestInit.dispatcher = this.socksDispatcher;
                }

                return fetch(input, requestInit);
            },

            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        if (this.clientToken !== null) {
                            request.headers.set('Authorization', `Bearer ${this.clientToken}`);
                        }
                    },
                ],

                afterResponse: [
                    async (
                        request: Request,
                        options: NormalizedOptions,
                        response: Response,
                    ): Promise<void> => {
                        response = response.clone();
                        request = request.clone();

                        const urlInstance = new URL(request.url);

                        this.logger.use('keyGenerateServiceRequest').trace(
                            {
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
                            `Generate Key - HTTP Request - ${this.getAppName()}`,
                        );
                    },
                ],
            },
        });
    }

    public async login(): Promise<void> {
        const response = await this.httpClient
            .post('promo/login-client', {
                json: {
                    appToken: this.getAppToken(),
                    clientId: this.clientId,
                    clientOrigin: 'android',
                },
            })
            .catch(async (error: HTTPError | Error) => {
                if (!('response' in error)) {
                    this.logger.error(error);
                    throw error;
                }

                const json: any | null = await error.response
                    .clone()
                    .json()
                    .catch(() => null);

                if (json === null) {
                    logger.error(error, error.response.clone().body as unknown as string);
                    throw error;
                }

                if (json.error_message) {
                    throw new Error(json.error_message);
                }

                throw error;
            });

        const data: any = await response.json();

        this.clientToken = data.clientToken;
    }

    public async processKey(): Promise<boolean> {
        const payload: {
            promoId: string;
            eventId: UUID;
            eventType?: string;
            eventOrigin: 'undefined';
        } = {
            promoId: this.getPromoId(),
            eventId: crypto.randomUUID(),
            eventOrigin: 'undefined',
        };

        if (this.getEventType()) {
            payload.eventType = this.getEventType();
        }

        const response = await this.httpClient
            .post('promo/register-event', {
                json: payload,
            })
            .catch(async (error: HTTPError | Error) => {
                if (!('response' in error)) {
                    throw error;
                }

                const json: any | null = await error.response
                    .clone()
                    .json()
                    .catch(() => null);

                if (json === null) {
                    logger.error(error, error.response.clone().body as unknown as string);
                    throw error;
                }

                if (json.error_code === 'TooManyRegister') {
                    throw new TooManyRegisterException(json.error_message, error);
                }

                throw error;
            });

        const data: any = await response.json();

        return data.hasCode;
    }

    public async getKey(): Promise<string> {
        const response = await this.httpClient
            .post('promo/create-code', {
                json: {
                    promoId: this.getPromoId(),
                },
            })
            .catch(async (error: HTTPError | Error) => {
                if (!(error instanceof HTTPError)) {
                    throw error;
                }

                const json: any | null = await error.response
                    .clone()
                    .json()
                    .catch(() => null);

                if (json === null) {
                    logger.error(error, error.response.clone().body as unknown as string);
                    throw error;
                }

                if (json.error_message) {
                    throw new Error(json.error_message);
                }

                throw error;
            });

        const data: any = await response.json();

        return data.promoCode;
    }

    public async generateKey(): Promise<string> {
        await this.login();

        for (let i = 0; i < 40; i++) {
            await sleep(30_000);

            const hasCode = await this.processKey().catch((error: TooManyRegisterException | Error) => {
                if (error instanceof TooManyRegisterException) {
                    return false;
                }

                if (error instanceof TimeoutError) {
                    return false;
                }

                if (error instanceof HTTPError) {
                    if (error.response.status === 503) {
                        return false;
                    }
                }

                throw error;
            });

            if (hasCode) {
                break;
            }
        }

        return await this.getKey();
    }
}
