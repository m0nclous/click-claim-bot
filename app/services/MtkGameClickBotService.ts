import { RedisService } from '@adonisjs/redis/types';
import app from '@adonisjs/core/services/app';
import MtkGameService from '#services/MtkGameService';

export class MtkGameClickBotService {
    public constructor(
        protected redis: RedisService,
    ) {}

    public async enableUser(userId: number): Promise<void> {
        await this.redis.sadd('mtk:click:users-enabled', userId);
    }

    public async disableUser(userId: number): Promise<void> {
        await this.redis.srem('mtk:click:users-enabled', userId);
    }

    public async getUsersEnabled(): Promise<string[]> {
        return this.redis.smembers('mtk:click:users-enabled');
    }

    public async execute(userId: string) {
        const mtkGameService: MtkGameService = await app.container.make('mtkGameService', [ userId ]);

        mtkGameService.login().then(() => {
            mtkGameService.tap(1);
        });
    }

    public run() {
        setInterval(async () => {
            const userIds: string[] = await this.getUsersEnabled();

            for (const userId of userIds) {
                this.execute(userId).then();
            }
        }, 10_000);
    }
}
