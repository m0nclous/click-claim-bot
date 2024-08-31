import { readFileSync } from 'fs';

export function getRandomLine(path: string, encoding: BufferEncoding = 'utf-8'): string {
    const fileContent = readFileSync(path, encoding);
    const lines = fileContent.split('\n');
    const randLineNum = Math.floor(Math.random() * lines.length);

    return lines[randLineNum] || getRandomLine(path, encoding);
}
