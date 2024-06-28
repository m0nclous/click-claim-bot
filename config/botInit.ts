import { telegraf } from '#config/telegram';
import { updateSession } from '../helpers/redis/index.js';

const botInit = async () => {
    telegraf.start((ctx) => ctx.reply('Welcome to Auto Bot Clicker'));

    telegraf.command('init',async (ctx) => {
        await updateSession(String(ctx.from.id), { token: ctx.telegram.token });
        await ctx.reply('Success authorize');
    });

    telegraf.command('start', async (ctx) => {
        await updateSession(String(ctx.from.id), { isStart: true });
        await ctx.reply('Bot has started');
    });

    telegraf.command('stop', async (ctx) => {
        await updateSession(String(ctx.from.id), { isStart: false });
        await ctx.reply('Bot has stopped');
    });

    await telegraf.launch();

    process.once('SIGINT', () => telegraf.stop('SIGINT'));
    process.once('SIGTERM', () => telegraf.stop('SIGTERM'));
};

export default botInit;
