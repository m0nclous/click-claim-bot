/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';
import { client } from '#config/telegram';

const BASE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset='UTF-8'>
        <title>GramJS + AdonisJS</title>
    </head>
    <body>{{0}}</body>
</html>
`;

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
            BASE_TEMPLATE.replace('{{0}}', '<a href="tg://resolve?domain=ClickClaimBot">@ClickClaimBot</a>'),
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
                onError: (err) => console.log(err),
            })
            .then();

        return response.send(BASE_TEMPLATE.replace('{{0}}', PHONE_FORM));
    }
});

router.post('/', async ({ request, response }) => {
    //To access POST variable use req.body()methods.
    if ('phone' in request.body()) {
        phone = request.body().phone;
        phoneCallback.resolve(phone);
        return response.send(BASE_TEMPLATE.replace('{{0}}', CODE_FORM));
    }

    if ('code' in request.body()) {
        codeCallback.resolve(request.body().code);
        return response.send(BASE_TEMPLATE.replace('{{0}}', PASSWORD_FORM));
    }
    if ('password' in request.body()) {
        passwordCallback.resolve(request.body().password);
        response.redirect('/');
    }
    console.log(request.body());
});
