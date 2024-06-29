/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';
import type { TelegramClient } from 'telegram';
import telegram from '#services/TelegramService';

const client: TelegramClient = await telegram.getClient();

const BASE_TEMPLATE = (error?: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset='UTF-8'>
        <title>GramJS + AdonisJS</title>
    </head>
    <body>{{0}}</body>
    ${error ? `<p style="color: red">${error}</p>` : '<p></p>'}
</html>
`;
};

const PHONE_FORM = `
<form action='/' method='post'>
    Phone (international format): <input name='phone' type='text' placeholder='+79999999999'>
    <input type='submit'>
</form>
`;

const CODE_FORM = `
<form action='/' method='post'>
    Telegram code: <input name='code' type='text' placeholder='12345'>
    <input type='submit'>
</form>
`;

const PASSWORD_FORM = `
<form action='/' method='post'>
    Telegram password: <input name='password' type='text' placeholder='your password (leave empty if no password)'>
    <input type='submit'>
</form>
`;

let phone;

let nextStep = 0;
let errMSG = '';

const steps = [PHONE_FORM, CODE_FORM, PASSWORD_FORM];

const phoneCallback = callbackPromise();
const codeCallback = callbackPromise();
const passwordCallback = callbackPromise();

function callbackPromise() {
    let resolve: any;
    let reject: any;

    const promise: Promise<unknown> = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

// define a route handler for the default home page
router.get('/', async ({ response }) => {
    if (await client.isUserAuthorized()) {
        return response.send(
            BASE_TEMPLATE().replace(
                '{{0}}',
                '<a href="tg://resolve?domain=ClickClaimBot">@ClickClaimBot</a>',
            ),
        );
    } else {
        client
            .start({
                phoneNumber: async () => {
                    return phoneCallback.promise as unknown as string;
                },
                phoneCode: async () => {
                    return codeCallback.promise as unknown as string;
                },
                password: async () => {
                    return passwordCallback.promise as unknown as string;
                },
                onError: (error: any) => {
                    errMSG = `Name: ${error.name}; Error message: ${error.errorMessage}; Message: ${error.message}`;
                    return Promise.resolve(true);
                },
            })
            .then(async () => {
                const authToken: string = client.session.save() as unknown as string;

                await telegram.saveSession(authToken);
            })
            .catch(console.error);

        if (!nextStep) return response.send(BASE_TEMPLATE(errMSG).replace('{{0}}', steps[nextStep]));
        return response;
    }
});

router.post('/', async ({ request, response }) => {
    //To access POST variable use req.body()methods.
    const body = request.body();

    if ('phone' in body) {
        nextStep = 1;
        phone = body.phone;
        phoneCallback.resolve(phone);
    }

    if ('code' in body) {
        nextStep = 2;
        codeCallback.resolve(body.code);
    }
    if ('password' in body) {
        nextStep = 0;
        passwordCallback.resolve(body.password);
        return response.redirect('/');
    }
    return response.send(BASE_TEMPLATE(errMSG).replace('{{0}}', steps[nextStep]));
});
