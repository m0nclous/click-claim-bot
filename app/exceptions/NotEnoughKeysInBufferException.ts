export default class NotEnoughKeysInBufferException extends Error {
    public constructor(
        public message: string,
        public previousError?: Error,
    ) {
        super(message);
    }
}
