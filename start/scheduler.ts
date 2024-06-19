import scheduler from 'adonisjs-scheduler/services/main';

scheduler.command('mtk:tap', ['--notify', '--quantity=60']).everyMinute();
scheduler.command('mtk:energy-reset', ['--notify', '--claim']).everyHours(1);
scheduler.command('mtk:collect-daily', ['--notify']).everyHours(6)

scheduler.command('gemz:tap', ['--notify', '--quantity=180']).everyMinute();
