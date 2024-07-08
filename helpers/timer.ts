export const sleep = (ms: number) => {
    if (ms < 0) {
        throw new TypeError('ms должен быть положительным');
    }

    return new Promise((resolve) => setTimeout(resolve, ms));
};
