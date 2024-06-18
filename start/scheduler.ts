import scheduler from 'adonisjs-scheduler/services/main';

scheduler.command('mtk:claim', ['--notify']).everyHours(1);
scheduler.command('mtk:energy-reset', ['--notify', '--claim']).everyHours(1);
scheduler.command('mtk:collect-daily', ['--notify']).everyHours(6);
