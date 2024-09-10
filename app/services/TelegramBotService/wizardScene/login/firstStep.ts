import app from '@adonisjs/core/services/app';
import { Markup } from 'telegraf';
import { ILoginState } from '#services/TelegramBotService/index';
import { LoginWizardContext } from './context.js';
import type { Logger } from '@adonisjs/core/logger';

const firstStep = (logger: Logger) => async (ctx: LoginWizardContext) => {
    if (ctx.message === undefined) {
        logger.error(
            {
                event: 'TELEGRAM_LOGIN_WIZARD',
                step: 1,
                ctxUpdate: ctx.update,
            },
            'ctx.message is undefined',
        );

        return;
    }

    const state: ILoginState = ctx.wizard.state;

    state.telegram = await app.container.make('telegram', [ctx.message.from.id]);
    state.client = await state.telegram.getClient();

    await state.client.connect();

    if (await state.client.isUserAuthorized()) {
        await ctx.reply('Telegram аккаунт уже привязан\nИспользуйте /logout для выхода');
        return ctx.scene.leave();
    }

    const message: string = 'Нажмите кнопку "Отправить номер телефона"';
    const keyboard = Markup.keyboard([
        [
            {
                text: '📲 Отправить номер телефона',
                request_contact: true,
            },
        ],
    ]).oneTime(true);

    await ctx.reply(message, keyboard);

    return ctx.wizard.next();
};

export default firstStep;
