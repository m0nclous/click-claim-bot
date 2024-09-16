import { ILoginState } from '../../services/TelegramBotService.js';
import { LoginWizardContext } from './context.js';
import type { Logger } from '@adonisjs/core/logger';

const lastStep = (logger: Logger) => async (ctx: LoginWizardContext) => {
    const withoutPass = ctx.scene.session.without_pass;
    let password = '';

    if (!withoutPass) {
        if (ctx.message === undefined) {
            logger.error(
                {
                    event: 'TELEGRAM_LOGIN_WIZARD',
                    step: 4,
                    ctxUpdate: ctx.update,
                },
                'ctx.message is undefined',
            );

            return;
        }

        if (!('text' in ctx.message!)) {
            logger.error(
                {
                    event: 'TELEGRAM_LOGIN_WIZARD',
                    step: 4,
                    ctxUpdate: ctx.update,
                },
                'ctx.message.text is undefined',
            );

            return;
        }

        password = ctx.message.text;
        await ctx.deleteMessage(ctx.message.message_id);
    }

    const state: ILoginState = ctx.wizard.state;

    state.passwordCallback?.resolve(password);
    await state.onLoginCallback?.promise;

    await state.telegram?.saveSession();
    await ctx.reply('Telegram аккаунт успешно привязан');

    logger.info(
        {
            userId: ctx.from!.id,
        },
        'Успешный вход в Telegram',
    );

    return await ctx.scene.leave();
};

export default lastStep;
