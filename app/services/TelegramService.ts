import type { Logger } from '@adonisjs/core/logger';
import { RedisService } from '@adonisjs/redis/types';
import { StringSession } from 'telegram/sessions/index.js';
import { TelegramClient } from 'telegram';
import app from '@adonisjs/core/services/app';

export interface TelegramConfig {
    id: number;
    userId: number;
    hash: string;
    sessionName: string;
    webserverHost: string;
    dc: {
        id: number;
        ip: string;
        port: number;
    };
}

export function defineConfig(config: TelegramConfig): TelegramConfig {
    return config;
}

export class TelegramService {
    protected client?: TelegramClient;

    constructor(
        public config: TelegramConfig,
        protected redis: RedisService,
        protected logger: Logger,
    ) {}

    public async getSession(userId?: number): Promise<StringSession> {
        const authKey: string | null = await this.redis.get(`${this.config.sessionName}:${userId}`);

        const session: StringSession = new StringSession(authKey ?? '');
        session.setDC(this.config.dc.id, this.config.dc.ip, this.config.dc.port);

        return session;
    }

    public async saveSession(token: string, userId: number): Promise<void> {
        await this.redis.hset(`${this.config.sessionName}:${userId}`, { token })
    }

    public async setSessionValue(userId: number, values: object): Promise<void> {
        await this.redis.hset(`${this.config.sessionName}:${userId}`, values);
    }

    public async getSessionValue(userId: number, field: string): Promise<any> {
        return this.redis.hget(`${this.config.sessionName}:${userId}`, field);
    }

    public async getClient(): Promise<TelegramClient> {
        if (this.client) {
            return this.client;
        }

        const session: StringSession = await this.getSession();

        this.client = new TelegramClient(session, this.config.id, this.config.hash, {
            connectionRetries: 5,
        });

        return this.client;
    }
}

let telegram: TelegramService;

await app.booted(async () => {
    telegram = await app.container.make('telegram');
});

export { telegram as default };
