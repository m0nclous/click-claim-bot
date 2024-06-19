/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { client } from '#config/telegram';
import { utils } from 'telegram';

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

// define a route handler for the default home page
router.get("/", async ({ response }) => {
    if (await client.isUserAuthorized()) {
        const dialog = (await client.getDialogs({ limit: 1 }))[0];

        let result = `<h1>${dialog.title}</h1>.`;
        for (const m of await client.getMessages(dialog.entity, { limit: 10 })) {
            result += formatMessage(m);
        }

        return response.send(BASE_TEMPLATE.replace("{{0}}", result));
    } else {
        client.start({
            phoneNumber: async () => {
                return phoneCallback.promise;
            },
            phoneCode: async () => {
                return codeCallback.promise;
            },
            password: async () => {
                return passwordCallback.promise;
            },
            onError: (err) => console.log(err),
        });

        return response.send(BASE_TEMPLATE.replace("{{0}}", PHONE_FORM));
    }
});

router.post("/", async ({ request, response }) => {
    //To access POST variable use req.body()methods.
    if ("phone" in request.body()) {
        phone = request.body().phone;
        phoneCallback.resolve(phone);
        return response.send(BASE_TEMPLATE.replace("{{0}}", CODE_FORM));
    }

    if ("code" in request.body()) {
        codeCallback.resolve(request.body().code);
        return response.send(BASE_TEMPLATE.replace("{{0}}", PASSWORD_FORM));
    }
    if ("password" in request.body()) {
        passwordCallback.resolve(request.body().password);
        response.redirect("/");
    }
    console.log(request.body());
});

function callbackPromise() {
    // helper method for promises
    let resolve, reject;

    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function formatMessage(message) {
    let content = (message.text || "(action message or media)").replace(
        "\n",
        "<br>"
    );
    return `<p><strong>${utils.getDisplayName(
        message.sender
    )}</strong>: ${content}<sub>${message.date}</sub></p>`;
}

const phoneCallback = callbackPromise();
const codeCallback = callbackPromise();
const passwordCallback = callbackPromise();
