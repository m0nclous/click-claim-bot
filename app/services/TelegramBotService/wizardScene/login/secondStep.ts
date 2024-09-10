import { callbackPromise } from '#helpers/promise';
import { Markup } from 'telegraf';
import { ILoginState } from '#services/TelegramBotService/index';
import { LoginWizardContext } from './context.js';
import type { Logger } from '@adonisjs/core/logger';

const secondStep = (logger: Logger) => async (ctx: LoginWizardContext) => {
    const state: ILoginState = ctx.wizard.state;

    if (ctx.message === undefined) {
        logger.error(
            {
                event: 'TELEGRAM_LOGIN_WIZARD',
                step: 2,
                ctxUpdate: ctx.update,
            },
            'ctx.message is undefined',
        );

        return;
    }

    if (!('contact' in ctx.message)) {
        logger.error(
            {
                event: 'TELEGRAM_LOGIN_WIZARD',
                step: 2,
                ctxUpdate: ctx.update,
            },
            'ctx.message.contact is undefined',
        );

        return;
    }

    state.phoneNumber = ctx.message.contact.phone_number;
    state.codeCallback = callbackPromise<string>();
    state.passwordCallback = callbackPromise();
    state.onLoginCallback = callbackPromise();

    const codePromise: Promise<string> = state.codeCallback.promise;
    const passwordPromise: Promise<string> = state.passwordCallback.promise;
    const onLoginResolve = state.onLoginCallback.resolve;

    if (state.client === undefined) {
        logger.error(
            {
                event: 'TELEGRAM_LOGIN_WIZARD',
                step: 2,
                ctxUpdate: ctx.update,
            },
            'state.client is undefined',
        );

        return;
    }

    state.client
        .start({
            phoneNumber: state.phoneNumber,
            phoneCode: async () => codePromise,
            password: async () => passwordPromise,
            onError: async (err: Error) => {
                throw err;
            },
        })
        .then(() => {
            onLoginResolve(true);
        })
        .catch(async (error: Error) => {
            logger.error(
                {
                    step: 2,
                    ctxUpdate: ctx.update,
                    error,
                },
                'Ошибка входа в Telegram',
            );

            await ctx.sendMessage('Не удалось войти в Telegram. Попробуйте еще раз.');
            await ctx.scene.leave();
        });

    const message: string =
        'Введите код для входа в <a href="https://t.me/+42777">Telegram</a>' +
        '\n\n❗️ Внимание!' +
        '\nРаздели код пробелами, например <code>1 2 3 4 5 6</code>\n' +
        'Иначе код будет недействительным!';

    await ctx.replyWithHTML(
        message,
        Markup.inlineKeyboard([
            [
                {
                    text: 'Посмотреть код',
                    url: 'https://t.me/+42777',
                },
            ],
        ]),
    );

    return ctx.wizard.next();
};

export default secondStep;
