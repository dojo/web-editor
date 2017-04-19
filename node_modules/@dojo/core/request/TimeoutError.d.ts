export default class TimeoutError implements Error {
    readonly message: string;
    readonly name: string;
    constructor(message?: string);
}
