import fs from 'node:fs';
import os from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename) + '/../';

const envFilePath = resolve(__dirname, '.env');
const readEnvVars = () => fs.readFileSync(envFilePath, 'utf-8').split(os.EOL);

/**
 * Updates value for existing key or creates a new key=value line
 *
 * This function is a modified version of https://stackoverflow.com/a/65001580/3153583
 *
 * @param {string} key Key to update/insert
 * @param {string} value Value to update/insert
 */
export default function setEnvValueToFile(key: string, value: string): void {
    const envVars = readEnvVars();
    const targetLine = envVars.find((line) => line.split('=')[0] === key);

    if (targetLine !== undefined) {
        // update existing line
        const targetLineIndex = envVars.indexOf(targetLine);

        // replace the key/value with the new value
        envVars.splice(targetLineIndex, 1, `${key}="${value}"`);
    } else {
        // create new key value
        envVars.push(`${key}="${value}"`);
    }

    // write everything back to the file system
    fs.writeFileSync(envFilePath, envVars.join(os.EOL));
};
