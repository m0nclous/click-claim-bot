import env from '#start/env';
import { defineConfig, targets } from '@adonisjs/core/logger';

const loggerConfig = defineConfig({
    default: 'app',

    /**
     * The loggers object can be used to define multiple loggers.
     * By default, we configure only one logger (named "app").
     */
    loggers: {
        app: {
            enabled: true,
            name: env.get('APP_NAME'),
            level: env.get('LOG_LEVEL'),
            transport: {
                targets: targets()
                    .push(targets.pretty())
                    .push({
                        target: 'pino-roll',
                        options: {
                            file: 'storage/logs/app.log',
                            frequency: 'daily',
                            mkdir: true,
                        },
                    })
                    .toArray(),
            },
        },
        gameServiceRequest: {
            enabled: true,
            name: 'game-service-request',
            level: env.get('LOG_LEVEL'),
            transport: {
                targets: targets()
                    .push(targets.pretty())
                    .push({
                        target: 'pino-roll',
                        options: {
                            file: 'storage/logs/game-service-requests.log',
                            frequency: 'daily',
                            mkdir: true,
                        },
                    })
                    .toArray(),
            },
        },
        keyGenerateServiceRequest: {
            enabled: true,
            name: 'key-generate-service-request',
            level: env.get('LOG_LEVEL'),
            transport: {
                targets: targets()
                    .push(targets.pretty())
                    .push({
                        target: 'pino-roll',
                        options: {
                            file: 'storage/logs/key-generate-service-requests.log',
                            frequency: 'daily',
                            mkdir: true,
                        },
                    })
                    .toArray(),
            },
        },
    },
});

export default loggerConfig;

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
    export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
