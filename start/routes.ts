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
    <style>
    .bg-ex-gradient-animation{
      background:linear-gradient(200deg,#a8d7e0,#213b40); /* Цвета градиента */
      background-size:500% 500%;
      -webkit-animation:ServiceAnimation 10s ease infinite;
      -moz-animation:ServiceAnimation 10s ease infinite;
      -o-animation:ServiceAnimation 10s ease infinite;
      animation:ServiceAnimation 10s ease infinite; /* Время смены цвета */
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    @-webkit-keyframes ServiceAnimation{0%
      {background-position:90% 0}50%
      {background-position:10% 100%}100%
      {background-position:90% 0}
    }
    @-moz-keyframes ServiceAnimation{0%
      {background-position:90% 0}50%
      {background-position:10% 100%}100%
      {background-position:90% 0}
    }
    @-o-keyframes ServiceAnimation{0%
      {background-position:90% 0}50%
      {background-position:10% 100%}100%
      {background-position:90% 0}
    }
    @keyframes ServiceAnimation{0%
      {background-position:90% 0}50%
      {background-position:10% 100%}100%
      {background-position:90% 0}
    }
   @import url(https://fonts.googleapis.com/css?family=Righteous);

    *, *:before, *:after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      position: relative;
      }

    html, body {
      height: 100%;
      }
      body {
        text-align: center;
        background-color: hsla(230,40%,50%,1);
        }
      body:before {
        content: '';
        display: inline-block;
        vertical-align: middle;
        font-size: 0;
        height: 100%;
        }

    h1 {
      display: inline-block;
      color: white;
      font-family: 'Righteous', serif;
      font-size: 12em;
      text-shadow: .03em .03em 0 hsla(230,40%,50%,1);
      }
      h1:after {
        content: attr(data-shadow);
        position: absolute;
        top: .06em; left: .06em;
        z-index: -1;
        text-shadow: none;
        background-image:
          linear-gradient(
            45deg,
            transparent 45%,
            hsla(48,20%,90%,1) 45%,
            hsla(48,20%,90%,1) 55%,
            transparent 0
            );
        background-size: .05em .05em;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        animation: shad-anim 15s linear infinite;
        }

    @keyframes shad-anim {
      0% {background-position: 0 0}
      0% {background-position: 100% -100%}
      }
    </style>
</head>
<body class="bg-ex-gradient-animation">
    <div>
    <div>
      <h1>Click Claim Bot</h1>
    </div>
    <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="${process.env.BOT_NAME}" data-size="large" data-auth-url="${process.env.WEB_SERVER_HOST}/login" data-request-access="write"></script>
    </div>
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
