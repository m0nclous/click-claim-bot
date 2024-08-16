export default class TooManyRegisterException extends Error {
    public constructor(
        public message: string,
        public previousError?: Error,
    ) {
        super(message);
    }
};
