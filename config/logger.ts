import env from '#start/env';
import app from '@adonisjs/core/services/app';
import { defineConfig, targets } from '@adonisjs/core/logger';
import { readFileSync } from 'node:fs';

const elasticsearchConfig = app.inProduction
    ? {
          target: 'pino-elasticsearch',
          level: env.get('LOG_LEVEL'),
          options: {
              node: `https://${env.get('ELASTIC_HOST')}:${env.get('ELASTIC_PORT')}`,
              esVersion: 8,
              auth: {
                  username: 'elastic',
                  password: env.get('ELASTIC_PASSWORD'),
              },
              tls: {
                  ca: readFileSync('./http_ca.crt'),
                  rejectUnauthorized: false,
              },
          },
      }
    : {
          target: 'pino-elasticsearch',
          level: env.get('LOG_LEVEL'),
          options: {
              node: `http://${env.get('ELASTIC_HOST')}:${env.get('ELASTIC_PORT')}`,
              esVersion: 8,
          },
      };

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
                    .pushIf(!app.inProduction, targets.pretty())
                    .push(elasticsearchConfig)
                    .toArray(),
            },
        },
        gameServiceRequest: {
            enabled: true,
            name: 'game-service-request',
            level: env.get('LOG_LEVEL'),
            transport: {
                targets: targets()
                    .pushIf(!app.inProduction, targets.pretty())
                    .push(elasticsearchConfig)
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
