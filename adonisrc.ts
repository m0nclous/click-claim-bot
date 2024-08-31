import { defineConfig } from '@adonisjs/core/app';

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    /*
    |--------------------------------------------------------------------------
    | Commands
    |--------------------------------------------------------------------------
    |
    | List of ace commands to register from packages. The application commands
    | will be scanned automatically from the "./commands" directory.
    |
    */
    commands: [() => import('@adonisjs/core/commands')],

    /*
    |--------------------------------------------------------------------------
    | Service providers
    |--------------------------------------------------------------------------
    |
    | List of service providers to import and register when booting the
    | application
    |
    */
    providers: [
        () => import('@adonisjs/core/providers/app_provider'),
        () => import('@adonisjs/core/providers/hash_provider'),
        {
            file: () => import('@adonisjs/core/providers/repl_provider'),
            environment: ['repl', 'test'],
        },
        () => import('@adonisjs/redis/redis_provider'),
        () => import('#providers/telegram_provider'),
        () => import('#providers/telegram_bot_provider'),
        () => import('#providers/app_provider'),
        () => import('#providers/MtkGameProvider'),
        () => import('#providers/GemzGameProvider'),
        () => import('#providers/MemeFiGameProvider'),
        () => import('#providers/Mine2MineGameProvider'),
        () => import('#providers/ZavodGameProvider'),
        () => import('#providers/ToonGameProvider'),
        () => import('#providers/TimeFarmGameProvider'),
        () => import('#providers/CityHoldersGameProvider'),
        () => import('#providers/CityHoldersClickBotServiceProvider'),
        () => import('#providers/MtkClickBotServiceProvider'),
        () => import('#providers/GemzClickBotServiceProvider'),
        () => import('#providers/MtkDailyBotServiceProvider'),
        () => import('#providers/GemzDailyBotServiceProvider'),
        () => import('#providers/MemeFiClickBotServiceProvider'),
        () => import('#providers/Mine2MineClickBotServiceProvider'),
        () => import('#providers/ZavodClaimBotServiceProvider'),
        () => import('#providers/ZavodCraftBotServiceProvider'),
        () => import('#providers/ToonClaimBotServiceProvider'),
        () => import('#providers/TimeFarmClaimBotServiceProvider'),
        () => import('#providers/CubeKeyGenerateProvider'),
        () => import('#providers/TrainKeyGenerateProvider'),
        () => import('#providers/MergeKeyGenerateProvider'),
        () => import('#providers/TwerkKeyGenerateProvider'),
        () => import('#providers/PolysphereKeyGenerateProvider'),
        () => import('#providers/MowAndTrimKeyGenerateProvider'),
        () => import('#providers/CafeDashKeyGenerateProvider'),
        () => import('#providers/GangsWarsKeyGenerateProvider'),
        () => import('#providers/ZoopolisKeyGenerateProvider'),
        () => import('#providers/ZoopolisKeyBufferProvider'),
        () => import('#providers/TrainKeyBufferProvider'),
        () => import('#providers/GangsWarsKeyBufferProvider'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Preloads
    |--------------------------------------------------------------------------
    |
    | List of modules to import before starting the application.
    |
    */
    preloads: [() => import('#start/kernel'), () => import('#start/events')],

    /*
    |--------------------------------------------------------------------------
    | Tests
    |--------------------------------------------------------------------------
    |
    | List of test suites to organize tests by their type. Feel free to remove
    | and add additional suites.
    |
    */
    tests: {
        suites: [
            {
                files: ['tests/unit/**/*.spec(.ts|.js)'],
                name: 'unit',
                timeout: 2000,
            },
            {
                files: ['tests/functional/**/*.spec(.ts|.js)'],
                name: 'functional',
                timeout: 30000,
            },
        ],
        forceExit: false,
    },
});
