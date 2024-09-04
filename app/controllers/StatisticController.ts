import { RedisService } from '@adonisjs/redis/types';
import app from '@adonisjs/core/services/app';

export default class CartItemsController {
    async getOnlineUsers() {
        const redis: RedisService = await app.container.make('redis');

        const activeUsersCount: number = (await redis.keys('user:*')).length;

        return {
            data: {
                onlineUsers: activeUsersCount,
            },
        };
    }
}
