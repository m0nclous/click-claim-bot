export default class UnauthenticatedException extends Error {
    public constructor(
        public message: string,
        public previousError?: Error,
    ) {
        super(message);
    }
}
