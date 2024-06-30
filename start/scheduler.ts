import scheduler from 'adonisjs-scheduler/services/main';
import redis from '@adonisjs/redis/services/main';
import { commandsQueue } from '#providers/app_provider';

scheduler
    .call(async () => {
        const userIds = await redis.lrange('bot:started', 0, -1);

        for (const userId of userIds) {
            commandsQueue.add({
                command: 'mtk:tap',
                argv: ['--notify', '--quantity=60', `--user-id=${userId}`],
            }).then();
        }
    })
    .everyMinute();

scheduler
    .call(async () => {
        const userIds = await redis.lrange('bot:started', 0, -1);

        for (const userId of userIds) {
            commandsQueue.add({
                command: 'mtk:energy-reset',
                argv: ['--notify', '--claim', `--user-id=${userId}`],
            }).then();
        }
    })
    .everyHours(1);

scheduler
    .call(async () => {
        const userIds = await redis.lrange('bot:started', 0, -1);

        for (const userId of userIds) {
            commandsQueue.add({
                command: 'mtk:collect-daily',
                argv: ['--notify', `--user-id=${userId}`],
            }).then();
        }
    })
    .everyHours(6);

scheduler
    .call(async () => {
        const userIds = await redis.lrange('bot:started', 0, -1);

        for (const userId of userIds) {
            commandsQueue.add({
                command: 'gemz:tap',
                argv: ['--notify', '--quantity=180', `--user-id=${userId}`],
            }).then();
        }
    })
    .everyMinute();

scheduler
    .call(async () => {
        const userIds = await redis.lrange('bot:started', 0, -1);

        for (const userId of userIds) {
            commandsQueue.add({
                command: 'gemz:collect-daily',
                argv: ['--notify', `--user-id=${userId}`],
            }).then();
        }
    })
    .everyHours(6);

scheduler
    .call(async () => {
        const userIds = await redis.lrange('bot:started', 0, -1);

        for (const userId of userIds) {
            commandsQueue.add({
                command: 'gemz:energy-reset',
                argv: ['--notify', `--user-id=${userId}`],
            }).then();
        }
    })
    .everyHours(1);
