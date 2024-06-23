import telegramConfig from '#config/telegram';
import { updateSession } from '../helpers/redis/index.js';

const bot =  telegramConfig.bot;

const botInit = async () => {
    bot.start((ctx) => ctx.reply('Welcome to Auto Bot Clicker'));

    bot.command('init',async (ctx) => {
        await updateSession(String(ctx.from.id), { token: ctx.telegram.token });
        await ctx.reply('Success authorize');
    });

    bot.command('start', async (ctx) => {
        await updateSession(String(ctx.from.id), { isStart: true });
        await ctx.reply('Bot has started');
    });

    bot.command('stop', async (ctx) => {
        await updateSession(String(ctx.from.id), { isStart: false });
        await ctx.reply('Bot has stopped');
    });

    await bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

export default botInit;
