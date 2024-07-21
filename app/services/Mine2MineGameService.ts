import BaseGameService, { HasTap } from '#services/BaseGameService';
import { URLSearchParams } from 'node:url';
import type { NormalizedOptions } from 'ky';
import 'eventsource';
import EventSource from 'eventsource';
import type { ITapEvent } from '#services/BaseClickBotService';
import emitter from '@adonisjs/core/services/emitter';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    interface EventsList {
        'mine2mine:tap': ITapEvent;
    }
}

export default class Mine2MineGameService extends BaseGameService implements HasTap {
    public constructor(userId: number) {
        super(userId);

        this.httpClient = this.httpClient.extend({
            hooks: {
                beforeRequest: [
                    async (request: Request) => {
                        if (this.isAuthenticated()) {
                            request.headers.set('Authorization', `Bearer ${this.token as string}`);
                        }
                    },
                ],

                afterResponse: [
                    async (_request: Request, _options: NormalizedOptions, response: Response) => {
                        const json: any = await new Response(response.clone().body).json().catch(() => ({}));

                        if (json?.token) {
                            this.token = json.token;
                        }
                    },
                ],
            },
        });
    }

    public getGameName(): string {
        return 'Mine2Mine';
    }

    protected getBotName(): string {
        return 'mine2mine_bot';
    }

    protected getWebViewUrl(): string {
        return 'https://mine2mine.org';
    }

    protected getBaseUrl(): string {
        return 'https://mine2mine.org';
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        await this.httpClient
            .get('api/v1/bot/auth', {
                searchParams: new URLSearchParams(await this.getInitDataKey()),
            })
            .json();
    }

    getTapQuantity(): Promise<number> {
        return new Promise((resolve) => {
            const eventSource = new EventSource(`${this.getBaseUrl()}/api/clicker/events`, {
                headers: {
                    Authorization: `Bearer ${this.token as string}`,
                    Accept: 'text/event-stream',
                },
            });

            eventSource.onmessage = (message: MessageEvent) => {
                const data = JSON.parse(message.data);
                resolve(data.energy);
                eventSource.close();
            };
        });
    }

    async tap(quantity: number): Promise<void> {
        await this.httpClient
            .post('api/clicker/click', {
                json: {
                    amount: quantity,
                    timestamp: Math.floor(new Date().setSeconds(0) / 1000),
                },
            })
            .json();

        await emitter.emit('mine2mine:tap', {
            self: this,
            userId: this.userId,
            quantity,
        });
    }
}
