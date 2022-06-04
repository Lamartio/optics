
export type Option<T> = None<T> | Some<T>

export enum OptionType {
    None = 'none',
    Some = 'some'
}

export interface OptionKind<T> {
    type: OptionType,

    get(or: T): T

    map<R>(transform: (some: T) => R): Option<R>

    flatMap<R>(transform: (some: T) => Option<R>): Option<R>

    fold<R>(ifNone: () => R, ifSome: (some: T) => R): R

}

export interface None<T> extends OptionKind<T> {
    type: OptionType.None
}

export interface Some<T> extends OptionKind<T> {
    type: OptionType.Some
    value: T
}

export function isSome<T>(option: OptionKind<T>): option is Some<T> {
    return option.type === OptionType.Some
}

export function isNone<T>(option: OptionKind<T>): option is None<T> {
    return option.type === OptionType.None
}