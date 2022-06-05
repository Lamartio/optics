import {Certain, SourceKind} from "./Source";
import {Option} from "./Option";
import {run} from "./index";
import {identity, OperatorFunction, Subject, Subscription} from "rxjs";
import {optionOf} from "./Option+factories";

type Async<T> = Idle | Executing | Failure | Success<T>

enum AsyncType {
    Idle = 'idle',
    Executing = 'executing',
    Failure = 'failure',
    Success = 'success',
}

interface AsyncKind {
    type: AsyncType
}

interface Idle extends AsyncKind {
    type: AsyncType.Idle
}

interface Executing extends AsyncKind {
    type: AsyncType.Executing
}
function asyncOfExecuting<T>() : Async<T> {
    return {
        type: AsyncType.Executing
    }
}

interface Failure extends AsyncKind {
    type: AsyncType.Failure
    reason: any
}

function asyncOfFailure<T>(reason: any): Async<T> {
    return {
        type: AsyncType.Failure,
        reason
    }
}

interface Success<T> extends AsyncKind {
    type: AsyncType.Success
    result: T
}

function asyncOfSuccess<T>(result: T): Async<T> {
    return {
        type: AsyncType.Success,
        result
    }
}

interface Loader<T> extends AsyncKind {
    state: Async<void>
    value: Option<T>
}

function loaderOf<T>(state: Async<void>, value: Option<T>) {
    return {
        type: state.type,
        state,
        value
    }
}


type State = {
    async: Async<string>,
    loader: Loader<string>
}

function test(source: Certain<State>) {
    run(source.compose('async'), async<string, string>(identity))("")
    run(source.compose('loader'), load<string, string>(identity))("")
}

interface Actions<P> {
    next(payload: P): void
    cancel(): void
    reset(): void
}

// TODO support for next, cancel and reset (and combinations of it in a transaction)
function async<T, P>(transform: OperatorFunction<P, T>, scope?: Subscription): (source: SourceKind<Async<T>>) => (payload: P) => void {
    return ({set}) => {
        const subject = new Subject<P>()
        const subscription = subject.pipe(transform).subscribe({
            next: result => set(asyncOfSuccess(result)),
            error: reason => set(asyncOfFailure(reason))
        })

        scope?.add(subscription)
        scope?.add(subject)

        return payload => {
            if (!subject.closed)
                subject.next(payload)
        }
    }
}
function load<T, P>(transform: OperatorFunction<P, T>, scope?: Subscription): (source: SourceKind<Loader<T>>) => (payload: P) => void {
    return (source) => {
        const subject = new Subject<P>()
        const subscription = subject.pipe(transform).subscribe({
            next: result => source.set(loaderOf(asyncOfExecuting(), optionOf(result))),
            error: reason => source.set(current => loaderOf(asyncOfFailure(reason), current.value)),
            complete: () => source.set(current => loaderOf(asyncOfSuccess(undefined), current.value))
        })

        scope?.add(subscription)
        scope?.add(subject)

        return payload => {
            if (!subject.closed) {
                // TODO if is idle, set executing
                subject.next(payload)
            }
        }
    }
}

