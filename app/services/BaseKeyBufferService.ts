import type { ApplicationService } from '@adonisjs/core/types';
import type { RedisService } from '@adonisjs/redis/types';
import type { BaseKeyGenerateService } from '#services/BaseKeyGenerateService';

export default abstract class BaseKeyBufferService {
    protected constructor(
        protected app: ApplicationService,
        protected redis: RedisService,
    ) {}

    protected abstract getKeyGenerateService(): Promise<BaseKeyGenerateService>;

    protected abstract getRedisSlug(): string;

    protected getRedisKey(): string {
        return `keys:${this.getRedisSlug()}`;
    }

    public async getKeys(quantity: number): Promise<string[]> {
        const keys: string[] = await this.redis.lpop(this.getRedisKey(), quantity).then((keys) => keys ?? []);

        if (keys.length < quantity) {
            const generatedKeys = await this.generateKeys(quantity - keys.length);
            keys.push(...generatedKeys);
        }

        return keys;
    }

    public async addKey(key: string): Promise<void> {
        await this.redis.lpush(this.getRedisKey(), key);
    }

    public async countKeys(): Promise<number> {
        return this.redis.llen(this.getRedisKey());
    }

    public async generateKeys(quantity: number): Promise<string[]> {
        const keyGenerateServices: BaseKeyGenerateService[] = [];

        for (let i = 0; i < quantity; i++) {
            keyGenerateServices.push(await this.getKeyGenerateService());
        }

        return Promise.all(keyGenerateServices.map((keyGenerateService) => keyGenerateService.generateKey()));
    }

    public async topUpKeys(): Promise<void> {
        const keys: string[] = await this.generateKeys(4);

        for (const key of keys) {
            await this.addKey(key);
        }
    }
}
