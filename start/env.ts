/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env';

export default await Env.create(new URL('../', import.meta.url), {
    NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
    PORT: Env.schema.number(),
    APP_KEY: Env.schema.string(),
    HOST: Env.schema.string({ format: 'host' }),
    LOG_LEVEL: Env.schema.string(),

    TELEGRAM_API_ID: Env.schema.number(),
    TELEGRAM_API_USER_ID: Env.schema.number(),
    TELEGRAM_API_HASH: Env.schema.string(),
    TELEGRAM_API_SESSION: Env.schema.string.optional(),

    TELEGRAM_BOT_TOKEN: Env.schema.string(),

    REDIS_HOST: Env.schema.string({ format: 'host' }),
    REDIS_PORT: Env.schema.number(),
    REDIS_PASSWORD: Env.schema.string.optional(),
});
