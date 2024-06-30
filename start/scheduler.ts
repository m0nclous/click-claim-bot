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
            });
        }
    })
    .everyMinute();

// scheduler.command('mtk:energy-reset', ['--notify', '--claim']).everyHours(1);
// scheduler.command('mtk:collect-daily', ['--notify']).everyHours(6);

// scheduler.command('gemz:tap', ['--notify', '--quantity=180']).everyMinute();
// scheduler.command('gemz:collect-daily', ['--notify']).everyHours(6);
// scheduler.command('gemz:energy-reset', ['--notify']).everyHours(1);
