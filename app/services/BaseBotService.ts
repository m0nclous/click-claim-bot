import type { RedisService } from '@adonisjs/redis/types';
import type { ApplicationService } from '@adonisjs/core/types';
import type BaseGameService from '#services/BaseGameService';
import { randomInt } from 'node:crypto';
import logger from '@adonisjs/core/services/logger';

export abstract class BaseBotService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {}

    public abstract getServiceSlug(): string;

    public abstract getGameServiceName(): string;

    public abstract getRedisSlug(): string;

    public abstract execute(userId: string): Promise<void>;

    protected abstract getIntervalDelay(): number;

    public getGameService(runtimeValues: any[] = []): Promise<BaseGameService> {
        return this.app.container.make(this.getGameServiceName(), runtimeValues);
    }

    protected getRedisPrefix(): string {
        return `${this.getServiceSlug()}:${this.getRedisSlug()}:`;
    }

    protected getRedisKey(key: string): string {
        return this.getRedisPrefix() + key;
    }

    public async addUser(userId: string): Promise<void> {
        await this.redis.sadd(this.getRedisKey('users'), userId);
    }

    public async removeUser(userId: string): Promise<void> {
        await this.redis.srem(this.getRedisKey('users'), userId);
    }

    public async getUsers(): Promise<string[]> {
        return this.redis.smembers(this.getRedisKey('users'));
    }

    public async run(): Promise<NodeJS.Timeout> {
        return setInterval(async () => {
            const userIds: string[] = await this.getUsers();

            for (const userId of userIds) {
                setTimeout(
                    () => {
                        this.execute(userId).then().catch((error) => {
                            logger.error(error);
                        });
                    },
                    randomInt(0, 60_000),
                );
            }
        }, this.getIntervalDelay());
    }
}
