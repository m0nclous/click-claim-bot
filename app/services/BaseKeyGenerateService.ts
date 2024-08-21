import ky, { HTTPError, KyInstance } from 'ky';
import type { NormalizedOptions } from '../../types/ky.js';
import logger from '@adonisjs/core/services/logger';
import { sleep } from '#helpers/timer';
import { UUID } from 'node:crypto';
import TooManyRegisterException from '#exceptions/TooManyRegisterException';

export abstract class BaseKeyGenerateService {
    protected clientToken: string | null = null;

    protected httpClient: KyInstance = this.makeHttpClient();

    protected constructor(protected clientId: string) {}

    protected abstract getAppToken(): string;

    protected abstract getPromoId(): string;

    protected abstract getEventType(): string;

    protected makeHttpClient(): KyInstance {
        return ky.extend({
            prefixUrl: 'https://api.gamepromo.io',
            headers: {
                'Content-Type': 'application/json',
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

                        logger.use('keyGenerateServiceRequest').trace({
                            event: 'KEY_GENERATE_HTTP',
                            appToken: this.getAppToken(),
                            clientId: this.clientId,
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
                        });
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
            .catch(async (error: HTTPError) => {
                const json: any = await error.response.json();

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
            .catch(async (error: HTTPError) => {
                const json: any = await error.response.json();

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
            .catch(async (error: HTTPError) => {
                const json: any = await error.response.json();

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

                throw error;
            });

            if (hasCode) {
                break;
            }
        }

        return await this.getKey();
    }
}
