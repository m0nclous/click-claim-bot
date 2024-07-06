export interface ICallbackPromise<T> {
    promise: Promise<T>;
    resolve: any;
    reject: any;
}

export const callbackPromise = <T>(): ICallbackPromise<T> => {
    let resolve: any;
    let reject: any;

    const promise: Promise<T> = new Promise<T>((resolveProxy, rejectProxy) => {
        resolve = resolveProxy;
        reject = rejectProxy;
    });

    return { promise, resolve, reject };
};
