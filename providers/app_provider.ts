import type { ApplicationService, ContainerBindings, LoggerService } from '@adonisjs/core/types';
import type { TelegramBotService } from '#services/TelegramBotService';
import type { UserFromGetMe } from '@telegraf/types/manage.js';
import { sleep } from '#helpers/timer';

type GameBotServiceBinding = keyof ContainerBindings;
type KeyGenerateServiceBinding = keyof ContainerBindings;

export default class AppProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async boot(): Promise<void> {
        const logger: LoggerService = await this.app.container.make('logger');

        if (this.app.getEnvironment() === 'web') {
            const telegramBot: TelegramBotService = await this.app.container.make('telegramBot');
            telegramBot.run().then((botInfo: UserFromGetMe) => {
                logger.info(
                    {
                        botInfo,
                    },
                    'Telegram бот запущен',
                );
            });

            const gameBotServicesToRun: GameBotServiceBinding[] = [
                'mtkClickBotService',
                'mtkDailyBotService',
                'gemzClickBotService',
                'cityHoldersClickBotService',
                'gemzDailyBotService',
                'memeFiClickBotService',
                'mine2MineClickBotService',
                'zavodClaimBotService',
                'toonClaimBotService',
                'timeFarmClaimBotService',
                'zavodCraftBotService',
            ];

            for (const gameBotServiceBinding of gameBotServicesToRun) {
                const service: ContainerBindings[keyof ContainerBindings] =
                    await this.app.container.make(gameBotServiceBinding);

                if (!('run' in service)) {
                    throw new Error('Run method is not implemented');
                }

                service.run().then(() => {
                    logger.info(`${service.constructor.name} запущен`);
                });
            }

            // Key generate

            const keyBufferServicesToRun: KeyGenerateServiceBinding[] = [
                'zoopolisKeyBuffer',
                'trainKeyBuffer',
                'cafeDashKeyBuffer',
                'mowAndTrimKeyBuffer',
                'cubeKeyBuffer',
                'mergeKeyBuffer',
                'twerkKeyBuffer',
                'polysphereKeyBuffer',
            ];

            for (const keyBufferServiceBinding of keyBufferServicesToRun) {
                const service: ContainerBindings[keyof ContainerBindings] =
                    await this.app.container.make(keyBufferServiceBinding);

                if (!('countKeys' in service)) {
                    throw new Error('countKeys method is not implemented');
                }

                if (!('topUpKeys' in service)) {
                    throw new Error('topUpKeys method is not implemented');
                }

                (async () => {
                    // eslint-disable-next-line no-constant-condition
                    while (true) {
                        if ((await service.countKeys()) >= 40) {
                            await sleep(60_000);
                            continue;
                        }

                        await service.topUpKeys();
                    }
                })().then();
            }
        }
    }
}
