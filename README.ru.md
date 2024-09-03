<div align="center">

[![Click Claim Bot][repo_logo_img]][repo_url]

# Click Claim Bot
Автоматизируй свой **фарм** в Telegram **Mini Apps**!

[![Node version][node_version_img]][node_dev_url]
[![Docker][docker_img]][docker_url]
[![License][repo_license_img]][repo_license_url]

### — Select Language —

[![en](https://img.shields.io/badge/en-red.svg?style=for-the-badge)](https://github.com/m0nclous/click-claim-bot/blob/master/README.md)
[![en](https://img.shields.io/badge/ru-blue.svg?style=for-the-badge)](https://github.com/m0nclous/click-claim-bot/blob/master/README.ru.md)

</div>

## 🤖 Поддерживаемые Mini Apps
- <a href="https://t.me/mtkbossbot/mtkmafia?startapp=ref1013774663" target="_blank"><img src="assets/img/mtk/mtk.jpg" width="20" alt="" style="vertical-align:middle"> $MTK Clicker Mafia</a>
    - Автоклик
    - Автосбор ежедневной награды

- <a href="https://t.me/geMzcoin_bot/tap?startapp=16bh6F-UNKSBgh2bHroyVJuS" target="_blank"><img src="assets/img/gemz/logo.jpg" width="20" alt="" style="vertical-align:middle"> Gemz</a>
    - Автоклик
    - Автосбор ежедневной награды

- <a href="https://t.me/memefi_coin_bot/main?startapp=r_61f7724676" target="_blank"><img src="assets/img/meme-fi/logo.jpg" width="20" alt="" style="vertical-align:middle"> MemeFi Coin</a>
    - Авто клик

- <a href="https://t.me/mine2mine_bot?start=MU0DupGZ" target="_blank"><img src="assets/img/mine2mine/logo.jpg" width="20" alt="" style="vertical-align:middle"> Mine2Mine</a>
    - Автоклик

- <a href="https://t.me/cityholder/game?startapp=1013774663" target="_blank"><img src="assets/img/city-holder/logo.jpg" width="20" alt="" style="vertical-align:middle"> City Holder</a>
    - Автоклик

- <a href="https://t.me/Mdaowalletbot?start=1013774663" target="_blank"><img src="assets/img/zavod/logo.jpg" width="20" alt="" style="vertical-align:middle"> ZAVOD Wallet</a>
    - Автосбор ресурсов
    - Автокрафт предметов

- <a href="https://t.me/toon_nation_bot/toon_nation?startapp=1013774663" target="_blank"><img src="assets/img/toon/logo.jpg" width="20" alt="" style="vertical-align:middle"> ToON Nation</a>
    - Автосбор ресурсов

- <a href="https://t.me/TimeFarmCryptoBot?start=1qo5WNP7jnLaAaLm4" target="_blank"><img src="assets/img/time-farm/logo.jpg" width="20" alt="" style="vertical-align:middle"> Time Farm</a>
    - Автосбор ресурсов

- <a href="https://t.me/hamster_kombaT_bot/start?startapp=kentId1013774663" target="_blank"><img src="assets/img/hamster-combat/logo.jpg" width="20" alt="" style="vertical-align:middle"> Hamster Kombat</a>
    - Генерация ключей


## 🏆️ Онлайн Бот без проблем

Используй готового онлайн бота для автоматизации своего фарма.
1. Перейди в Telegram бота <a href="https://t.me/ClickClaimBot" target="_blank">@ClickClaimBot</a>
2. Нажми кнопку `Старт` или введи команду `/start`
3. Используй команду `/login` для привязки Telegram сессии
4. Предоставь свой контакт боту  
   Это потребуется для входа в аккаунт
5. Введи код, отправленный в Telegram для входа.  
   **Важно! Нужно разделить числа пробелами**
6. Введи свой облачный пароль от Telegram  
   **Важно! После ввода пароль будет сразу удалён из чата!**  
   Пароли не сохраняются на сервере!
7. Готово! После успешной привязки аккаунта бот сможет автоматизировать твой фарм в Telegram Mini Apps

## ⚡️ Быстрый старт (self-hosted)

Для получения сессии игр и отправки запросов нужно зарегистрировать Telegram приложение
1. Перейди в личный кабинет Telegram [my.telegram.org](https://my.telegram.org)
2. Войди по номеру телефона
3. Перейди в раздел [API development tools](https://my.telegram.org/apps)
4. Создай новое приложение
5. Тебе понадобятся данные: `api_id`, `api_hash`, `Production configuration`

Для управления приложением нужно создать чат-бота Telegram [t.me/BotFather](https://t.me/BotFather)  
Тебе понадобится `Token HTTP API` и `username`

### 🐳 Быстрый старт через Docker
Установи `docker` на свою OS  
Ты можешь найти инструкцию в открытых источниках

Установи `docker-compose`    
Ты можешь найти инструкцию в открытых источниках

Создай папку для click-claim-bot

Создай файл `docker-compose.yml`
```yaml
services:
    app:
        image: m0nclous/click-claim-bot:v1.6.7
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

Создай файл `.env`
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

Отредактируй `.env` и вставь актуальные данные:
- APP_KEY - случайный UUID [uuidgenerator.net](https://www.uuidgenerator.net)
- TELEGRAM_API_ID - api_id ранее созданного Telegram приложения
- TELEGRAM_API_HASH - api_hash ранее созданного Telegram приложения
- TELEGRAM_DC_ID - DC ID из секции Available MTProto servers (Production configuration)
- TELEGRAM_DC_IP - IP из секции Available MTProto servers (Production configuration)
- TELEGRAM_DC_PORT - PORT из секции Available MTProto servers (Production configuration)
- TELEGRAM_BOT_TOKEN - Token созданного бота в [@BotFather](https://t.me/BotFather)
- TELEGRAM_BOT_NAME - Username созданного бота в [@BotFather](https://t.me/BotFather)
- REDIS_PASSWORD - случайный UUID [uuidgenerator.net](https://www.uuidgenerator.net)

Вот и всё, бот готов к запуску: используй команду `docker-compose up -d`

## ⚙️ Команды Telegram Бота

### Base:
- `/start` — Старт Бота
- `/login` — Авторизация в Telegram
- `/logout` — Разлогиниться из Telegram 
- `/enable` — Активировать работу Telegram бота
- `/disable` — Деактивировать работу Telegram бота
- `/status` — Статус Бота

### Gemz:
- `/bot_gemz_click_start` — Запуск автоклика Gemz
- `/bot_gemz_click_stop` — Остановка автоклика Gemz
- `/bot_gemz_daily_start` — Запуск сбора ежедневной награды Gemz
- `/bot_gemz_daily_stop` — Остановка сбора ежедневной награды Gemz

### MTK:
- `/bot_mtk_click_start` — Запуск автоклика MTK
- `/bot_mtk_click_stop` — Остановка автоклика MTK
- `/bot_mtk_daily_start` — Запуск сбора ежедневной MTK
- `/bot_mtk_daily_stop` — Остановка сбора ежедневной MTK

### MemeFI Coin:
- `/bot_memefi_click_start` — Запуск автоклика MemeFI
- `/bot_memefi_click_stop` — Остановка автоклика MemeFI

### Mine 2 Mine:
- `/bot_mine2mine_click_start` — Запуск автоклика Mine2Mine
- `/bot_mine2mine_click_stop` — Остановка автоклика Mine2Mine

### Citi Holders:
- `/bot_city_holders_click_start` — Запуск автоклика City Holders
- `/bot_city_holders_click_stop` — Остановка автоклика City Holders

### Zavod:
- `/bot_zavod_claim_start` — Запуск автосбора ресурсов Zavod
- `/bot_zavod_claim_stop` — Остановка автосбора ресурсов Zavod
- `/bot_zavod_craft_start` — Запуск автокрафта предметов Zavod
- `/bot_zavod_craft_stop` — Остановка автокрафта предметов Zavod

### ToON:
- `/bot_toon_claim_start` — Запуск автосбора ресурсов ToON
- `/bot_toon_claim_stop` — Остановка автосбора ресурсов ToON

### Time Farm
- `/bot_time_farm_claim_start` — Запуск автосбора ресурсов Time Farm
- `/bot_time_farm_claim_stop` — Остановка автосбора ресурсов Time Farm

### Hamster Combat
- `/get_keys_hamster_combat` — Получить все ключи от мини игр

## ❗️ Поддержите автора

Ты можешь поддержать автора на [Boosty][boosty_url], как на _постоянной_ так и на _разовой_ основе.

Все доходы от этого пойдут на **поддержку** моих проектов и вдохновят меня на **создание** новых продуктов.

<a href="https://boosty.to/koddr/donate" target="_blank"><img width="300" alt="поддержи меня на Boosty" src="https://raw.githubusercontent.com/koddr/.github/main/images/boosty-badge.svg"/></a>

## 🏆 Беспроигрышное сотрудничество

И теперь я приглашаю вас принять участие в этом проекте! Давайте работать **вместе**, чтобы
создайте **самый полезный** инструмент для веб-разработчиков сегодня.

- [Issues][repo_issues_url]: задавайте вопросы и отправляйте свои предложения.
- [Pull requests][repo_pull_request_url]: отправляйте свои улучшения.

## ⚠️ Лицензия

[Click Claim Bot][repo_url] — является **бесплатным** программным обеспечением с **открытым исходным кодом**, имеющим лицензию [MIT License][repo_license_url].

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
