import { SubscriptionObserver } from '@dojo/shim/Observable';
export default class SubscriptionPool<T> {
    private _observers;
    private _queue;
    private _queueMaxLength;
    constructor(maxLength?: number);
    add(subscription: SubscriptionObserver<T>): () => void;
    next(value: T): void;
    complete(): void;
}
