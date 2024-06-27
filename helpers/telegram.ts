import telegramConfig from '#config/telegram';
import app from '@adonisjs/core/services/app';
import type { RedisService } from '@adonisjs/redis/types';

const redis: RedisService = await app.container.make('redis');

export async function saveSessionAuthKey(key: string): Promise<void> {
    await redis.set(telegramConfig.api.sessionName, key);
}

export async function getSessionAuthKey(): Promise<string | null> {
    return redis.get(telegramConfig.api.sessionName);
}
