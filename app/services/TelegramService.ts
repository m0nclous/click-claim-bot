import { RedisService } from '@adonisjs/redis/types';
import { StringSession } from 'telegram/sessions/index.js';
import { TelegramClient } from 'telegram';

export interface TelegramConfig {
    id: number;
    hash: string;
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
        public userId: number,
        public config: TelegramConfig,
        protected redis: RedisService,
    ) {}

    public async getSession(): Promise<StringSession> {
        const authKey: string | null = await this.redis.hget(`user:${this.userId}`, 'auth-key');

        const session: StringSession = new StringSession(authKey ?? '');
        session.setDC(this.config.dc.id, this.config.dc.ip, this.config.dc.port);

        return session;
    }

    public async saveSession(authKey: string): Promise<void> {
        await this.redis.hset(`user:${this.userId}`, 'auth-key', authKey);
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
