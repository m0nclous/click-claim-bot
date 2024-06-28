// TODO реализовано через redis провайдер
import { createClient } from 'redis';

interface ISession {
    token: string,
    isStart: boolean,
}

const client = await createClient({ url: 'redis://redis:6379' })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

export const getSession = (key: string): Promise<ISession> => {
    return client.hGetAll(key) as unknown as Promise<ISession>;
};

export const updateSession = async (key: string, values: object) => {
    return Promise.all([Object.entries(values).map(async ([k, v]) => {
        await client.hSet(key, k, v);
    })]);
};
