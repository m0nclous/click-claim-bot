/**
 * Функция ожидания заданного времени в миллисекундах
 *
 * @param ms Время ожидания в миллисекундах
 * @returns Promise<void>
 */
export const sleep = (ms: number) => {
    if (!Number.isInteger(ms) || ms < 0) {
        throw new TypeError('ms должен быть положительным целым числом');
    }

    return new Promise((resolve) => setTimeout(resolve, ms));
};
