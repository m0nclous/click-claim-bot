/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';
import { TelegramService } from '#services/TelegramService';
import crypto from 'crypto';
import telegramBotConfig from '#config/telegram-bot';
import app from '@adonisjs/core/services/app';

const resHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Telegram Login Widget</title>
</head>
<body>
<p>Login via telegram</p>
<script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="${process.env.BOT_NAME}" data-size="large" data-auth-url="${process.env.WEB_SERVER_HOST}/login" data-request-access="write"></script>
</body>
</html>
`

const checkHash = (data: any, token: string) => {
    const secret = crypto.createHash('sha256').update(token).digest();
    let array = [];

    for (let key in data){
        if (key != 'hash') {
            array.push(key + '=' + data[key]);
        }
    }
    const check_hash = crypto
        .createHmac('sha256', secret)
        .update(array.sort().join('\n'))
        .digest('hex');

    return check_hash == data.hash;
}

router.get('/login', async ({ request, response }) => {
    const queryObject = request.qs();
    const isHashValid = checkHash(queryObject, telegramBotConfig.token);

    if (isHashValid) {
        const telegram: TelegramService = await app.container.make('telegram');
        console.log('User info: ',queryObject);
        await telegram.saveSession(queryObject.hash, queryObject.id);
        return response.redirect(`https://t.me/${process.env.BOT_NAME}?start=authorize`);
    } else {
        response.status(403);
        return response.send('<div>Access denied</div>');
    }
});

router.get('/', async ({ response }) => {
    return response.send(resHTML);
});
