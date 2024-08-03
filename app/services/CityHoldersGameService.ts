import BaseGameService, { HasTap } from '#services/BaseGameService';
import avro from 'avsc';
import WebSocket from 'ws';
import { callbackPromise, ICallbackPromise } from '#helpers/promise';
import type { ITapEvent } from '#services/BaseClickBotService';
import emitter from '@adonisjs/core/services/emitter';

declare module '@adonisjs/core/types' {
    // noinspection JSUnusedGlobalSymbols
    interface EventsList {
        'city-holders:tap': ITapEvent;
    }
}

interface IAuthResponse {
    ok: true;
    token: string;
    shard_url: string;
}

const RequestType = avro.Type.forSchema({
    name: 'Request',
    type: 'record',
    fields: [
        {
            name: 'auth',
            type: ['null', 'string'],
        },
        {
            name: 'content',
            type: [
                'null',
                {
                    type: 'array',
                    items: 'int',
                },
            ],
        },
    ],
});

const SyncRequestMessage = avro.Type.forSchema({
    name: 'SyncRequestMessage.SyncRequestMessage',
    type: 'record',
    fields: [
        {
            name: 'id',
            type: 'long',
        },
        {
            name: 'action',
            type: 'string',
        },
        {
            name: 'timestamp',
            type: 'double',
        },
    ],
});

const SyncResponseMessage = avro.Type.forSchema({
    name: 'SyncResponseMessage.SyncResponseMessage',
    type: 'record',
    fields: [
        {
            name: 'id',
            type: 'long',
        },
        {
            name: 'holder_power',
            type: 'long',
        },
        {
            name: 'balance',
            type: 'long',
        },
        {
            name: 'total_balance',
            type: 'long',
        },
        {
            name: 'earned_money',
            type: 'long',
        },
        {
            name: 'energy',
            type: 'long',
        },
        {
            name: 'daily_energy_restored',
            type: 'long',
        },
        {
            name: 'max_energy',
            type: 'long',
        },
        {
            name: 'city',
            type: [
                {
                    name: 'SyncResponseMessage.City',
                    type: 'record',
                    fields: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'level',
                            type: 'long',
                        },
                        {
                            name: 'created_at',
                            type: 'double',
                        },
                        {
                            name: 'buildings',
                            type: {
                                type: 'array',
                                items: {
                                    name: 'SyncResponseMessage.Building',
                                    type: 'record',
                                    fields: [
                                        {
                                            name: 'id',
                                            type: 'string',
                                        },
                                        {
                                            name: 'level',
                                            type: 'long',
                                        },
                                        {
                                            name: 'build_at',
                                            type: 'double',
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
                'null',
            ],
        },
        {
            name: 'turbo_boost',
            type: [
                {
                    name: 'SyncResponseMessage.TurboBoost',
                    type: 'record',
                    fields: [
                        {
                            name: 'attempts',
                            type: 'long',
                        },
                        {
                            name: 'last_use_timestamp',
                            type: ['double', 'null'],
                        },
                    ],
                },
                'null',
            ],
        },
        {
            name: 'instant_recovery_boost',
            type: [
                {
                    name: 'SyncResponseMessage.InstantRecoveryBoost',
                    type: 'record',
                    fields: [
                        {
                            name: 'attempts',
                            type: 'long',
                        },
                        {
                            name: 'last_use_timestamp',
                            type: ['double', 'null'],
                        },
                    ],
                },
                'null',
            ],
        },
        {
            name: 'energy_boost',
            type: [
                {
                    name: 'SyncResponseMessage.EnergyBoost',
                    type: 'record',
                    fields: [
                        {
                            name: 'level',
                            type: 'long',
                        },
                    ],
                },
                'null',
            ],
        },
        {
            name: 'energy_recovery_rate_boost',
            type: [
                {
                    name: 'SyncResponseMessage.EnergyRecoveryRateBoost',
                    type: 'record',
                    fields: [
                        {
                            name: 'level',
                            type: 'long',
                        },
                    ],
                },
                'null',
            ],
        },
        {
            name: 'last_collection_time',
            type: 'double',
        },
        {
            name: 'missions',
            type: [
                {
                    type: 'array',
                    items: 'long',
                },
                'null',
            ],
        },
        {
            name: 'daily_reward_counter',
            type: 'long',
        },
        {
            name: 'time_between_last_online_and_now',
            type: 'double',
        },
        {
            name: 'is_daily_reward',
            type: 'boolean',
        },
        {
            name: 'is_early',
            type: 'boolean',
        },
        {
            name: 'early_friends',
            type: 'long',
        },
        {
            name: 'accumulated_ref_balance',
            type: 'long',
        },
        {
            name: 'all_first_level_ref_balance',
            type: 'long',
        },
        {
            name: 'all_second_level_ref_balance',
            type: 'long',
        },
        {
            name: 'all_third_level_ref_balance',
            type: 'long',
        },
    ],
});

const ResponseType = avro.Type.forSchema({
    name: 'Response',
    type: 'record',
    fields: [
        {
            name: 'is_ok',
            type: 'boolean',
        },
        {
            name: 'error',
            type: [
                'null',
                {
                    name: 'ErrorResponse',
                    type: 'record',
                    fields: [
                        {
                            name: 'code',
                            type: 'int',
                        },
                        {
                            name: 'message',
                            type: 'string',
                        },
                    ],
                },
            ],
        },
        {
            name: 'content',
            type: [
                'null',
                {
                    type: 'array',
                    items: 'int',
                },
            ],
        },
    ],
});

const TapType = avro.Type.forSchema({
    type: 'record',
    namespace: 'TapMessage',
    name: 'TapMessage',
    fields: [
        {
            type: 'long',
            name: 'id',
        },
        {
            type: 'string',
            name: 'action',
        },
        {
            type: 'long',
            name: 'count_of_taps',
        },
        {
            type: 'double',
            name: 'timestamp',
        },
    ],
});

export default class CityHoldersGameService extends BaseGameService implements HasTap {
    protected ws: WebSocket | null = null;

    protected wsCallbackPromise: ICallbackPromise<any> | null = null;

    public getGameName(): string {
        return 'CityHolders';
    }

    protected getBotName(): string {
        return 'cityholderbot';
    }

    protected getWebViewUrl(): string {
        return 'https://app.city-holder.com';
    }

    protected getBaseUrl(): string {
        return 'https://api.city-holder.com';
    }

    async makeWebSocket(url: string): Promise<WebSocket> {
        if (this.ws !== null) {
            return this.ws;
        }

        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';

        this.ws.on('message', (data: ArrayBuffer) => {
            const buffer = Buffer.from(data);
            const response = ResponseType.fromBuffer(buffer);

            if (this.wsCallbackPromise !== null) {
                if (response.is_ok) {
                    return this.wsCallbackPromise.resolve(response.content ? Buffer.from(response.content) : null);
                } else {
                    return this.wsCallbackPromise.reject(response.error.message);
                }
            }
        });

        return new Promise<WebSocket>((resolve) => {
            this.ws!.on('open', () => {
                resolve(this.ws!);
            });
        });
    }

    async websocketRequest(data: any): Promise<Buffer | null> {
        this.wsCallbackPromise = callbackPromise();
        this.ws!.send(RequestType.toBuffer(data));
        return this.wsCallbackPromise.promise;
    }

    async login(): Promise<void> {
        if (this.isAuthenticated()) {
            return;
        }

        const response: IAuthResponse = await this.httpClient.post('auth', {
            json: {
                auth: await this.getInitDataKey(),
            },
        }).json();

        this.token = response.token;
        await this.makeWebSocket(response.shard_url);
        await this.websocketRequest({
            auth: this.token,
            content: null,
        });
    }

    async getTapQuantity(): Promise<number> {
        const responseBuffer = await this.websocketRequest({
            auth: null,
            content: [...SyncRequestMessage.toBuffer({
                action: 'sync',
                id: 1,
                timestamp: new Date().getTime() / 1000,
            })],
        });

        if (responseBuffer === null) {
            throw new Error('Buffer is empty');
        }

        const response = SyncResponseMessage.fromBuffer(responseBuffer);

        return response.energy;
    }

    async tap(quantity: number): Promise<void> {
        await this.websocketRequest({
            auth: null,
            content: [...TapType.toBuffer({
                action: 'tap',
                count_of_taps: quantity,
                timestamp: new Date().getTime() / 1000,
                id: 2,
            })],
        });

        await emitter.emit('city-holders:tap', {
            self: this,
            userId: this.userId,
            quantity,
        });
    }
}
