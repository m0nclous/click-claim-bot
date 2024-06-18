import scheduler from 'adonisjs-scheduler/services/main';

scheduler.command('mtk:claim', ['--notify']).everyHours(1);
