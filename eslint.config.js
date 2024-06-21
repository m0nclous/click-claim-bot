import js from '@eslint/js';

import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eslintrc = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
});

// noinspection JSUnusedGlobalSymbols
export default [
    // JavaScript
    {
        rules: js.configs.recommended.rules,

        ignores: ['dist/**/*', 'node_modules/**/*'],
    },

    // TypeScript
    ...eslintrc.extends('plugin:@typescript-eslint/recommended').map((config) => ({
        ...config,
        ignores: ['dist/**/*', 'node_modules/**/*'],
        rules: {
            ...config.rules,
            '@typescript-eslint/no-explicit-any': 'off',
        },
    })),

    // Project scripts
    {
        files: ['**/*.ts', '**/*.js', '**/*.vue'],
        ignores: ['dist/**/*', 'node_modules/**/*'],
        rules: {
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'eol-last': ['error', 'always'],
            'linebreak-style': ['error', 'unix'],
        },
    },
];
