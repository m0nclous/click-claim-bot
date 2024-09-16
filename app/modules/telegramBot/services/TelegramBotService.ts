import { Composer, type Context, Markup, Scenes, session, Telegraf } from 'telegraf';
import type { RedisService } from '@adonisjs/redis/types';
import type { Logger } from '@adonisjs/core/logger';
import type { UserFromGetMe } from '@telegraf/types/manage.js';
import Commands from '../commands.js';
import { LoginWizardContext } from '../wizardScene/login/context.js';
import loginSteps from '../wizardScene/login/steps.js';
import { parseBoolean } from '#helpers/parse';
import type { TelegramService } from '#services/TelegramService';
import app from '@adonisjs/core/services/app';
import type { TelegramClient } from 'telegram';
import BaseKeyBufferService from '#services/BaseKeyBufferService';
import NotEnoughKeysInBufferException from '#exceptions/NotEnoughKeysInBufferException';
import logger from '@adonisjs/core/services/logger';
import type { BaseBotService } from '#services/BaseBotService';
import { HTTPError } from 'ky';
import UnauthenticatedException from '#exceptions/UnauthenticatedException';
import type { ICallbackPromise } from '#helpers/promise';

export class TelegramBotService {
    public bot: Telegraf;

    constructor(
        public config: TelegramBotConfig,
        protected redis: RedisService,
        protected logger: Logger,
    ) {
        this.bot = new Telegraf(this.config.token);
    }

    public async run(): Promise<UserFromGetMe> {
        await this.setupLoginWizard();
        await this.setupCommands();

        return new Promise((resolve, reject) => {
            this.bot.launch(() => {
                if (this.bot.botInfo !== undefined) {
                    resolve(this.bot.botInfo);
                } else {
                    reject('Bot info is undefined');
                }
            });
        });
    }

    protected async setupCommands() {
        this.bot.command('start', this.start.bind(this));
        this.bot.command('login', this.login.bind(this));
        this.bot.command('logout', this.logout.bind(this));
        this.bot.command('status', this.status.bind(this));

        this.bot.command('bot_mtk_click_start', this.botMtkClickStart.bind(this));
        this.bot.command('bot_mtk_click_stop', this.botMtkClickStop.bind(this));

        this.bot.command('bot_gemz_click_start', this.botGemzClickStart.bind(this));
        this.bot.command('bot_gemz_click_stop', this.botGemzClickStop.bind(this));

        this.bot.command('bot_memefi_click_start', this.botMemeFiClickStart.bind(this));
        this.bot.command('bot_memefi_click_stop', this.botMemeFiClickStop.bind(this));

        this.bot.command('bot_mine2mine_click_start', this.botMine2MineClickStart.bind(this));
        this.bot.command('bot_mine2mine_click_stop', this.botMine2MineClickStop.bind(this));

        this.bot.command('bot_city_holders_click_start', this.botCityHoldersClickStart.bind(this));
        this.bot.command('bot_city_holders_click_stop', this.botCityHoldersClickStop.bind(this));

        this.bot.command('bot_mtk_daily_start', this.botMtkDailyStart.bind(this));
        this.bot.command('bot_mtk_daily_stop', this.botMtkDailyStop.bind(this));

        this.bot.command('bot_gemz_daily_start', this.botGemzDailyStart.bind(this));
        this.bot.command('bot_gemz_daily_stop', this.botGemzDailyStop.bind(this));

        this.bot.command('bot_zavod_claim_start', this.botZavodClaimStart.bind(this));
        this.bot.command('bot_zavod_claim_stop', this.botZavodClaimStop.bind(this));

        this.bot.command('bot_zavod_craft_start', this.botZavodCraftStart.bind(this));
        this.bot.command('bot_zavod_craft_stop', this.botZavodCraftStop.bind(this));

        this.bot.command('bot_toon_claim_start', this.botToonClaimStart.bind(this));
        this.bot.command('bot_toon_claim_stop', this.botToonClaimStop.bind(this));

        this.bot.command('bot_time_farm_claim_start', this.botTimeFarmClaimStart.bind(this));
        this.bot.command('bot_time_farm_claim_stop', this.botTimeFarmClaimStop.bind(this));

        this.bot.command('bot_farty_beetle_craft_start', this.botFartyBeetleCraftStart.bind(this));
        this.bot.command('bot_farty_beetle_craft_stop', this.botFartyBeetleCraftStop.bind(this));

        this.bot.command('best_card_for_buy_hamster_combat', this.getBestCardForBuyHamsterCombat.bind(this));
        this.bot.command('get_keys_hamster_combat', this.getKeysHamsterCombat.bind(this));

        return this.bot.telegram.setMyCommands(Commands);
    }

    protected async setupLoginWizard() {
        const passwordStepHandler = new Composer<LoginWizardContext>();

        passwordStepHandler.action('without_pass', async (ctx) => {
            ctx.scene.session.without_pass = true;
            ctx.wizard.next();

            if (typeof ctx.wizard.step === 'function') {
                return ctx.wizard.step(ctx, () => Promise.resolve());
            }
        });

        passwordStepHandler.on('message', async (ctx) => {
            ctx.wizard.next();

            if (typeof ctx.wizard.step === 'function') {
                return ctx.wizard.step(ctx, () => Promise.resolve());
            }
        });

        const loginWizard = new Scenes.WizardScene(
            'login',
            loginSteps.firstStep(this.logger),
            loginSteps.secondStep(this.logger),
            loginSteps.thirdStep(this.logger),
            passwordStepHandler,
            loginSteps.lastStep(this.logger),
        );

        loginWizard.use(async (ctx, next) => {
            // Если пришло событие обновления участников чата
            if ('my_chat_member' in ctx.update) {
                // Обработка случаев, когда пользователь остановил бота
                if (['kicked', 'left'].includes(ctx.update.my_chat_member.new_chat_member.status)) {
                    this.logger.debug(
                        {
                            ctxUpdate: ctx.update,
                        },
                        'Бот остановлен',
                    );

                    // Выход со сцены и остановка дальнейших middleware
                    return ctx.scene.leave();
                } else {
                    this.logger.trace(
                        {
                            ctxUpdate: ctx.update,
                        },
                        'Бот добавлен',
                    );

                    return;
                }
            }

            return next();
        });

        const stage = new Scenes.Stage<any>([loginWizard]);

        this.bot.use(session());
        this.bot.use(stage.middleware());
    }

    public async isStarted(userId: number): Promise<boolean> {
        return parseBoolean(await this.redis.hget(`user:${userId}:bot`, 'started'));
    }

    public async start(ctx: Context): Promise<void> {
        const message: string =
            'Привет\\! Я умею тапать и клеймить игры вместо тебя\\!\n\n' +
            'Чтобы начать — мне необходимо войти в твой Telegram\n' +
            'Так я смогу открывать твои игры и собирать награды\\.\n\n' +
            'Чтобы начать процесс привязки Telegram аккаунта\n' +
            'Используй команду /login';

        await ctx.replyWithMarkdownV2(message, Markup.removeKeyboard());
    }

    public async login(ctx: Context): Promise<void> {
        // @ts-expect-error scene на самом деле есть, надо будет поработать с типами
        await ctx.scene.enter('login');
    }

    public async logout(ctx: Context): Promise<void> {
        if (ctx.message === undefined) {
            this.logger.error(
                {
                    event: 'TELEGRAM_COMMAND',
                    command: 'logout',
                    ctx,
                },
                'ctx.message is undefined',
            );

            return;
        }

        const telegram: TelegramService = await app.container.make('telegram', [ctx.message.from.id]);

        await telegram.forgetSession();
        await ctx.reply('Вы успешно вышли');
    }

    public async status(ctx: Context): Promise<void> {
        if (!(await this.checkUser(ctx))) return;

        const telegram: TelegramService = await app.container.make('telegram', [ctx.from?.id]);

        const telegramClient: TelegramClient = await telegram.getClient();
        await telegramClient.connect();

        const hasTelegramSession: boolean = await telegramClient.isUserAuthorized();
        const isStarted: boolean = await this.isStarted(ctx.from!.id);

        const text: string =
            `Телеграм аккаунт привязан: ${hasTelegramSession}\n` + `Бот запущен: ${isStarted}`;

        await ctx.reply(text);
    }

    public async botMtkClickStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'mtkClickBotService');
    }

    public async botMtkClickStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'mtkClickBotService');
    }

    public async botGemzClickStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'gemzClickBotService');
    }

    public async botGemzClickStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'gemzClickBotService');
    }

    public async botMemeFiClickStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'memeFiClickBotService');
    }

    public async botMemeFiClickStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'mine2MineClickBotService');
    }

    public async botMine2MineClickStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'mine2MineClickBotService');
    }

    public async botMine2MineClickStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'memeFiClickBotService');
    }

    public async botCityHoldersClickStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'cityHoldersClickBotService');
    }

    public async botCityHoldersClickStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'cityHoldersClickBotService');
    }

    public async botMtkDailyStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'mtkDailyBotService');
    }

    public async botMtkDailyStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'mtkDailyBotService');
    }

    public async botGemzDailyStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'gemzDailyBotService');
    }

    public async botGemzDailyStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'gemzDailyBotService');
    }

    public async botZavodClaimStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'zavodClaimBotService');
    }

    public async botZavodClaimStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'zavodClaimBotService');
    }

    public async botZavodCraftStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'zavodCraftBotService');
    }

    public async botZavodCraftStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'zavodCraftBotService');
    }

    public async botToonClaimStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'toonClaimBotService');
    }

    public async botToonClaimStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'toonClaimBotService');
    }

    public async botTimeFarmClaimStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'timeFarmClaimBotService');
    }

    public async botTimeFarmClaimStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'timeFarmClaimBotService');
    }

    public async botFartyBeetleCraftStart(ctx: Context): Promise<void> {
        await this.enableServiceByUserId(ctx, 'fartyBeetleCraftBotService');
    }

    public async botFartyBeetleCraftStop(ctx: Context): Promise<void> {
        await this.stopServiceByUserId(ctx, 'fartyBeetleCraftBotService');
    }

    public async getKeysHamsterCombat(ctx: Context): Promise<void> {
        const quantityKeys: number = 4;
        const fluffCrusadeQuantityKeys: number = 8;
        const serviceBindings: string[] = [
            'zoopolisKeyBuffer',
            'mowAndTrimKeyBuffer',
            'cubeKeyBuffer',
            'trainKeyBuffer',
            'mergeKeyBuffer',
            'twerkKeyBuffer',
            'polysphereKeyBuffer',
            'tileTrioKeyBuffer',
            'fluffCrusadeKeyBuffer',
            'stoneAgeKeyBuffer',
        ];

        const services: BaseKeyBufferService[] = await Promise.all(
            serviceBindings.map((serviceBinding) => app.container.make(serviceBinding)),
        );

        const haveRequiredNumberKeys: boolean = await Promise.all(
            services.map(async (service: BaseKeyBufferService) => {
                const countKeys = await service.countKeys();
                const appName = (await service.getKeyGenerateService()).getAppName();

                if (countKeys < (appName === 'Fluff Crusade' ? fluffCrusadeQuantityKeys : quantityKeys)) {
                    throw new NotEnoughKeysInBufferException(`В ${appName} буфере недостаточно ключей`);
                }
            }),
        )
            .then(() => {
                return true;
            })
            .catch(async (error) => {
                if (error instanceof NotEnoughKeysInBufferException) {
                    return false;
                }

                throw error;
            });

        if (!haveRequiredNumberKeys) {
            await ctx.reply('В буфере недостаточно ключей. Попробуйте позже');
            return;
        }

        Promise.all(
            services.map(async (service: BaseKeyBufferService) => {
                const appName = (await service.getKeyGenerateService()).getAppName();
                const keys = await service.getKeys(
                    appName === 'Fluff Crusade' ? fluffCrusadeQuantityKeys : quantityKeys,
                );

                return { appName, keys };
            }),
        ).then(async (result) => {
            const messageLines = [];

            for (const generated of result) {
                messageLines.push(`— ${generated.appName} —`);
                messageLines.push(...generated.keys.map((key) => `<code>${key}</code>`));
                messageLines.push('');
            }

            await ctx.replyWithHTML(messageLines.join('\n').trim());
        });
    }

    public async getBestCardForBuyHamsterCombat(ctx: Context) {
        if (ctx.from === undefined) {
            logger.error(ctx, 'ctx.from is undefined');
            await ctx.reply('Error: ctx.from is undefined');
            return;
        }

        const service = await app.container.make('hamsterCombatGameService', [ctx.from.id]);
        await service.login();

        const upgrade = await service.getBestUpgradeForBuy();
        const messageLines = [
            '— Лучшая карта для покупки —',
            `Название: <code>${upgrade.name}</code>`,
            `Раздел: <code>${upgrade.section}</code>`,
            `Уровень: ${upgrade.level}`,
            `Прирост дохода: ${upgrade.profitPerHourDelta.toLocaleString()}`,
            `Стоимость: ${upgrade.price.toLocaleString()}`,
            `Стоимость за единицу прироста дохода: ${Math.floor(upgrade.price / upgrade.profitPerHourDelta).toLocaleString()}`,
        ];

        await ctx.replyWithHTML(messageLines.join('\n'));
    }

    private async enableServiceByUserId(ctx: Context, serviceName: string) {
        const userId: string = ctx.from?.id.toString() || '';

        const service: BaseBotService = await app.container.make(serviceName);

        try {
            await service.execute(userId);
        } catch (error) {
            let errorJson = null;

            if (error instanceof HTTPError) {
                errorJson = await error.response.json().catch(() => null);
            }

            const messageLines = ['Не удалось активировать сервис'];

            if (errorJson) {
                messageLines.push(
                    `<pre><code class="json">${JSON.stringify(errorJson, null, 4)}</code></pre>`,
                );
            } else if (error instanceof UnauthenticatedException) {
                logger.debug(error);
            } else {
                logger.error(error);
            }

            await ctx.react('👎');
            await ctx.replyWithHTML(messageLines.join('\n'));
            return;
        }

        await service.addUser(userId);

        await ctx.react('👌');
    }

    private async stopServiceByUserId(ctx: Context, serviceName: string) {
        const userId: string = ctx.from?.id.toString() || '';

        const service: BaseBotService = await app.container.make(serviceName);
        await service.removeUser(userId);

        await ctx.react('👌');
    }

    private async checkUser(ctx: Context) {
        if (!ctx.from?.id) {
            this.logger.error(
                {
                    event: 'TELEGRAM_CHECK_USER',
                    ctx,
                },
                'Не найден ID пользователя',
            );

            await ctx.reply('Ошибка, попробуйте позже');
            return false;
        }
        return true;
    }
}

let telegramBot: TelegramBotService;

await app.booted(async () => {
    telegramBot = await app.container.make('telegramBot', [0]);
});

export { telegramBot as default };

export interface TelegramBotConfig {
    token: string;
}

export function defineConfig(config: TelegramBotConfig): TelegramBotConfig {
    return config;
}

export interface ILoginState {
    telegram?: TelegramService;
    client?: TelegramClient;
    phoneNumber?: string;
    codeCallback?: ICallbackPromise<string>;
    passwordCallback?: ICallbackPromise<string>;
    onLoginCallback?: ICallbackPromise<true>;
}
