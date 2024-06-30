import { ApplicationService } from '@adonisjs/core/types';
import Bull, { DoneCallback, Job } from 'bull';
import redis from '#config/redis';
import { Kernel } from '@adonisjs/core/ace';
import { TelegramBotService } from '#services/TelegramBotService';

export let commandsQueue: Bull.Queue;

export default class AppProvider {
    constructor(protected app: ApplicationService) {}

    // noinspection JSUnusedGlobalSymbols
    public async boot(): Promise<void> {
        commandsQueue = new Bull('commands', {
            redis: {
                port: redis.connections.queue.port,
                host: redis.connections.queue.host,
                password: redis.connections.queue.password,
                db: redis.connections.queue.db,
            },
        });

        if (this.app.getEnvironment() === 'web') {
            const telegramBot: TelegramBotService = await this.app.container.make('telegramBot');
            await telegramBot.run();

            commandsQueue.process(async (job: Job, done: DoneCallback) => {
                const ace: Kernel = await this.app.container.make('ace');

                try {
                    await ace.exec(job.data.command, job.data.argv);
                } catch (error) {
                    console.log(error);
                    return done(error);
                }

                done();
            }).then();
        }
    }
}
