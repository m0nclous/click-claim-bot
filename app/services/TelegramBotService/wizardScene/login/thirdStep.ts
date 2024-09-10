import { parseNumbers } from '#helpers/parse';
import { Markup } from 'telegraf';
import { ILoginState } from '#services/TelegramBotService/index';
import { LoginWizardContext } from './context.js';
import type { Logger } from '@adonisjs/core/logger';

const thirdStep = (logger: Logger) => async (ctx: LoginWizardContext) => {
    if (ctx.message === undefined) {
        logger.error(
            {
                event: 'TELEGRAM_LOGIN_WIZARD',
                step: 3,
                ctxUpdate: ctx.update,
            },
            'ctx.message is undefined',
        );

        return;
    }

    if (!('text' in ctx.message)) {
        logger.error(
            {
                event: 'TELEGRAM_LOGIN_WIZARD',
                step: 3,
                ctxUpdate: ctx.update,
            },
            'ctx.message.text is undefined',
        );

        return;
    }

    const state: ILoginState = ctx.wizard.state;
    const phoneCode: string = parseNumbers(ctx.message.text);

    state.codeCallback?.resolve(phoneCode);

    await ctx.replyWithHTML(
        'Введите облачный пароль Telegram',
        Markup.inlineKeyboard([[{ text: 'У меня нет пароля', callback_data: 'without_pass' }]]),
    );

    return ctx.wizard.next();
};

export default thirdStep;
