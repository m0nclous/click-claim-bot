<div align="center">

[![Click Claim Bot][repo_logo_img]][repo_url]

# Click Claim Bot
Automate your **farming** in Telegram **Mini Apps**!

[![Node version][node_version_img]][node_dev_url]
[![Docker][docker_img]][docker_url]
[![License][repo_license_img]][repo_license_url]

### — Select Language —

[![en](https://img.shields.io/badge/en-red.svg?style=for-the-badge)](https://github.com/m0nclous/click-claim-bot/blob/master/README.md)
[![ru](https://img.shields.io/badge/ru-blue.svg?style=for-the-badge)](https://github.com/m0nclous/click-claim-bot/blob/master/README.ru.md)

</div>

## 🤖 Supported Mini Apps
- <a href="https://t.me/mtkbossbot/mtkmafia?startapp=ref1013774663" target="_blank"><img src="assets/img/mtk/mtk.jpg" width="20" alt="" style="vertical-align:middle"> $MTK Clicker Mafia</a>
  - Auto Click
  - Auto Claim Daily

- <a href="https://t.me/geMzcoin_bot/tap?startapp=16bh6F-UNKSBgh2bHroyVJuS" target="_blank"><img src="assets/img/gemz/logo.jpg" width="20" alt="" style="vertical-align:middle"> Gemz</a>
  - Auto Click
  - Auto Claim Daily

- <a href="https://t.me/memefi_coin_bot/main?startapp=r_61f7724676" target="_blank"><img src="assets/img/meme-fi/logo.jpg" width="20" alt="" style="vertical-align:middle"> MemeFi Coin</a>
  - Auto Click

- <a href="https://t.me/mine2mine_bot?start=MU0DupGZ" target="_blank"><img src="assets/img/mine2mine/logo.jpg" width="20" alt="" style="vertical-align:middle"> Mine2Mine</a>
  - Auto Click

- <a href="https://t.me/cityholder/game?startapp=1013774663" target="_blank"><img src="assets/img/city-holder/logo.jpg" width="20" alt="" style="vertical-align:middle"> City Holder</a>
  - Auto Click

- <a href="https://t.me/Mdaowalletbot?start=1013774663" target="_blank"><img src="assets/img/zavod/logo.jpg" width="20" alt="" style="vertical-align:middle"> ZAVOD Wallet</a>
  - Auto Claim
  - Auto Craft

- <a href="https://t.me/toon_nation_bot/toon_nation?startapp=1013774663" target="_blank"><img src="assets/img/toon/logo.jpg" width="20" alt="" style="vertical-align:middle"> ToON Nation</a>
  - Auto Claim

- <a href="https://t.me/TimeFarmCryptoBot?start=1qo5WNP7jnLaAaLm4" target="_blank"><img src="assets/img/time-farm/logo.jpg" width="20" alt="" style="vertical-align:middle"> Time Farm</a>
  - Auto Claim

- <a href="https://t.me/hamster_kombaT_bot/start?startapp=kentId1013774663" target="_blank"><img src="assets/img/hamster-combat/logo.jpg" width="20" alt="" style="vertical-align:middle"> Hamster Kombat</a>
  - Generate Game Keys

## 🏆️ Online bot without problems
Use a ready-made online bot to automate your farm.

1. Go to Telegram bot <a href="https://t.me/ClickClaimBot" target="_blank">@ClickClaimBot</a>
2. Press the `Start` button or type `/start`
3. Use the `/login` command to start the Telegram session binding process
4. Provide your contact to the bot  
   This will be required to log into your account
5. Enter the code sent to Telegram to login  
   **Important! Numbers need to be separated by spaces**
6. Enter your cloud password from Telegram  
   **Important! Once entered, the password will be immediately removed from the chat!**  
   Passwords are not saved on the server!
7. Congratulations!  
   After successfully linking your account, the bot will be able to automate your farming in Telegram Mini Apps

## ⚡️ Quick start (self-hosted)

### Telegram App
To receive session games and make requests, you must register the Telegram application.
1. Go to your personal Telegram account [my.telegram.org](https://my.telegram.org)
2. Login by phone number
3. Go to section [API development tools](https://my.telegram.org/apps)
4. Create a new application
5. You will need data: `api_id`, `api_hash`, `Production configuration`

### Telegram Bot
To manage a click-claim-bot, you need to create a Telegram chatbot. [t.me/BotFather](https://t.me/BotFather)  
You will need `Token HTTP API` and `username`

### 🐳 Docker-way to quick start
Install `docker` for you OS  
You can find instructions on open sources

Install `docker-compose`  
You can find instructions on open sources

Create new folder for click-claim-bot

Create `docker-compose.yml`  
```yaml
services:
    app:
        image: m0nclous/click-claim-bot:v1.7.0
        restart: unless-stopped
        volumes:
            - './storage/logs:/app/storage/logs'
            - './proxy-list.txt:/app/proxy-list.txt'
        environment:
            APP_KEY: '${APP_KEY}'

            TZ: '${TZ:-UTC}'
            NODE_ENV: '${NODE_ENV:-production}'

            REDIS_HOST: '${REDIS_HOST:-redis}'
            REDIS_PORT: '${REDIS_PORT:-6379}'
            REDIS_PASSWORD: '${REDIS_PASSWORD:-}'

            TELEGRAM_API_ID: '${TELEGRAM_API_ID}'
            TELEGRAM_API_HASH: '${TELEGRAM_API_HASH}'

            TELEGRAM_BOT_TOKEN: '${TELEGRAM_BOT_TOKEN}'
            TELEGRAM_BOT_NAME: '${TELEGRAM_BOT_NAME}'

            LOG_LEVEL: '${LOG_LEVEL:-trace}'
            LOGTAIL_SOURCE_TOKEN: '${LOGTAIL_SOURCE_TOKEN:-}'

            KEY_GENERATE_USE_PROXY: '${KEY_GENERATE_USE_PROXY:-false}'
            KEY_GENERATE_PROXY_USER: '${KEY_GENERATE_PROXY_USER:-}'
            KEY_GENERATE_PROXY_PASSWORD: '${KEY_GENERATE_PROXY_PASSWORD:-}'

        depends_on:
            redis:
                condition: service_healthy

    redis:
        image: 'redis:7.2.5-alpine'
        restart: unless-stopped
        command: ['redis-server', '--requirepass ${REDIS_PASSWORD}']
        ports:
            - '${FORWARD_REDIS_PORT:-6379}:6379'
        volumes:
            - 'redis-data:/data'
        healthcheck:
            test:
                - CMD
                - redis-cli
                - ping
            retries: 3
            timeout: 5s

volumes:
    redis-data:
```

Create `.env`
```dotenv
### App
HOST=127.0.0.1
# Random UUID https://www.uuidgenerator.net
APP_KEY=
TZ=UTC

### Telegram MTP https://my.telegram.org/apps
# App api_id
TELEGRAM_API_ID=
# App api_hash
TELEGRAM_API_HASH=
# MTProto Production configuration
TELEGRAM_DC_ID=2
TELEGRAM_DC_IP=149.154.167.50
TELEGRAM_DC_PORT=443

### Telegram Bot https://t.me/BotFather
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_NAME=

### Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

### Logs
LOG_LEVEL=trace
# BetterStack https://logs.betterstack.com
LOGTAIL_SOURCE_TOKEN=

### SOCKS5 Proxy
KEY_GENERATE_USE_PROXY=false
KEY_GENERATE_PROXY_USER=
KEY_GENERATE_PROXY_PASSWORD=
```

Edit `.env` and insert the current data:
- APP_KEY - random UUID [uuidgenerator.net](https://www.uuidgenerator.net)
- TELEGRAM_API_ID - api_id of a previously created Telegram application
- TELEGRAM_API_HASH - api_hash of a previously created Telegram application
- TELEGRAM_DC_ID - DC ID from the Available section MTProto servers (Production configuration)
- TELEGRAM_DC_IP - IP from the Available section MTProto servers (Production configuration)
- TELEGRAM_DC_PORT - PORT from the Available section MTProto servers (Production configuration)
- TELEGRAM_BOT_TOKEN - Token of the created bot in [@BotFather](https://t.me/BotFather)
- TELEGRAM_BOT_NAME - Username of the created bot in [@BotFather](https://t.me/BotFather)
- REDIS_PASSWORD - random UUID [uuidgenerator.net](https://www.uuidgenerator.net)

That's it, the bot is ready to launch: use the command `docker-compose up -d`

## ⚙️ Telegram Bot Commands

### Base:
- `/start` — Start Bot
- `/login` — Login to Telegram
- `/logout` — Logout from Telegram
- `/enable` — Enable Telegram bot work (deprecated)
- `/disable` — Disable Telegram bot work (deprecated)
- `/status` — Bot status

### Gemz:
- `/bot_gemz_click_start` — Start Gemz auto click
- `/bot_gemz_click_stop` — Stop Gemz auto click
- `/bot_gemz_daily_start` — Start Gemz daily reward
- `/bot_gemz_daily_stop` — Stop Gemz daily reward

### MTK:
- `/bot_mtk_click_start` — Start MTK auto click
- `/bot_mtk_click_stop` — Stop MTK auto click
- `/bot_mtk_daily_start` — Start MTK daily reward
- `/bot_mtk_daily_stop` — Stop MTK daily reward

### MemeFI Coin:
- `/bot_memefi_click_start` — Start MemeFI auto click
- `/bot_memefi_click_stop` — Stop MemeFI auto click

### Mine 2 Mine:
- `/bot_mine2mine_click_start` — Start Mine2Mine auto click
- `/bot_mine2mine_click_stop` — Stop Mine2Mine auto click

### Citi Holders:
- `/bot_city_holders_click_start` — Start City Holders auto click
- `/bot_city_holders_click_stop` — Stop City Holders auto click

### Zavod:
- `/bot_zavod_claim_start` — Start Zavod auto claim
- `/bot_zavod_claim_stop` — Stop Zavod auto claim
- `/bot_zavod_craft_start` — Start Zavod auto craft
- `/bot_zavod_craft_stop` — Stop Zavod auto craft

### ToON:
- `/bot_toon_claim_start` — Start ToON auto claim
- `/bot_toon_claim_stop` — Stop ToON auto claim

### Time Farm
- `/bot_time_farm_claim_start` — Start Time Farm auto claim
- `/bot_time_farm_claim_stop` — Stop Time Farm auto claim

### Hamster Combat
- `/get_keys_hamster_combat` — Get keys for all available games

## ❗️ Support the author

You can support the author on [Boosty][boosty_url], both on a _permanent_ and on a _one-time_ basis.

All proceeds from this way will go to **support** my projects and will energize me to **create** new features.

<a href="https://boosty.to/m0nclous/donate" target="_blank"><img width="300" alt="support me on Boosty" src="assets/img/m0nclous-donate.svg"/></a>

## 🏆 A win-win cooperation

And now, I invite you to participate in this project! Let's work **together** to
create the **most useful** bot on the web today.

- [Issues][repo_issues_url]: ask questions and submit your features.
- [Pull requests][repo_pull_request_url]: send your improvements to the current.

## ⚠️ License

[Click Claim Bot][repo_url] — is **free** and **open-source** software licensed under
the [MIT License][repo_license_url].

<!-- App -->

[node_version_img]: https://img.shields.io/badge/Node_JS-20.10.0-green?style=for-the-badge&logo=nodedotjs
[docker_img]: https://img.shields.io/badge/Docker-blue?style=for-the-badge&logo=docker
[docker_url]: https://hub.docker.com/r/m0nclous/click-claim-bot
[node_dev_url]: https://nodejs.org/en/blog/release/v20.10.0

<!-- Repository -->

[repo_url]: https://github.com/m0nclous/click-claim-bot
[repo_logo_img]: assets/img/logo.png
[repo_license_url]: https://github.com/m0nclous/click-claim-bot/blob/master/LICENSE
[repo_license_img]: https://img.shields.io/badge/License-MIT-red?style=for-the-badge
[repo_issues_url]: https://github.com/m0nclous/click-claim-bot/issues
[repo_pull_request_url]: https://github.com/m0nclous/click-claim-bot/pulls

<!-- Other projects links -->

[boosty_url]: https://boosty.to/
