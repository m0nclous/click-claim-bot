import { RedisService } from '@adonisjs/redis/types';
import { ApplicationService } from '@adonisjs/core/types';
import BaseGameService from '#services/BaseGameService';

export abstract class BaseBotService {
    public constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {}

    public abstract getServiceSlug(): string;

    public abstract getGameServiceName(): string;

    public abstract getRedisSlug(): string;

    public abstract execute(userId: string): Promise<void>;

    public abstract run(): Promise<NodeJS.Timeout>;

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
}
