import {Option} from "./Option";
import {Lens, Mask} from "./Optic";

export type Source<T> = Certain<T> | Uncertain<T>
export type Update<T> = T | ((value: T) => T)

export enum SourceType {
    Certain = 'certain',
    Uncertain = 'uncertain'
}

export interface SourceKind<S> {
    type: SourceType

    getOr(): Option<S>

    set(value: Update<S>): void
}

export interface Certain<S> extends SourceKind<S> {
    type: SourceType.Certain

    get(): S

    composeLens<F>(lens: Lens<S, F>): Certain<F>

    composeMask<F>(lens: Mask<S, F>): Uncertain<F>

    compose<K extends keyof S>(key: K): Certain<S[K]>

    guard<F extends S>(predicate: (source: S) => source is F) : Uncertain<F>

    asTuple(): [() => S, (value: Update<S>) => void]

}

export interface Uncertain<S> extends SourceKind<S> {
    type: SourceType.Uncertain

    get(): Option<S>

    composeLens<F>(lens: Lens<S, F>): Uncertain<F>

    composeMask<F>(lens: Mask<S, F>): Uncertain<F>

    compose<K extends keyof S>(key: K): Uncertain<S[K]>

    guard<F extends S>(predicate: (source: S) => source is F) : Uncertain<F>

    asTuple(): [() => Option<S>, (value: Update<S>) => void]
}

export function isCertain<T>(value: SourceKind<T>): value is Certain<T> {
    return value.type === SourceType.Certain
}

export function isUncertain<T>(value: SourceKind<T>): value is Uncertain<T> {
    return value.type === SourceType.Uncertain
}