import { createClient, ErrorReply } from 'redis';

const client = await createClient({ url: 'redis://redis:6379' })
    .on('error', (err: ErrorReply) => console.log('Redis Client Error', err))
    .connect();

export const saveSession = (key: string, value: string): Promise<string | null> => {
    return client.set(key, value);
};

export const getSession = (key: string): Promise<string | null> => {
    return client.get(key);
};
