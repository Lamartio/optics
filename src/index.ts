export type Nullable<T> = T | undefined | null | never

export function identity<T>(value: T): T {
    return value
}

export function run<T, R>(value: T, transform: (value: T) => R): R {
    return transform(value)
}

export function pipe<A, R>(a: (a: A) => R): (a: A) => R
export function pipe<A, B, R>(a: (a: A) => B, b: (b: B) => R): (a: A) => R
export function pipe<A, B, C, R>(a: (a: A) => B, b: (b: B) => C, c: (c: C) => R): (a: A) => R
export function pipe<A, B, C, D, R>(a: (a: A) => B, b: (b: B) => C, c: (c: C) => D, d: (d: D) => R): (a: A) => R
export function pipe<T, R>(...fns: ((a: any) => any)[]): (value: T) => R {
    return fns.reduce((l, r) => a => { r(l(a)) })
}

export function isFunction(value: any) : value is Function {
    return value instanceof Function
}

export function isNonNullable<T>(value: Nullable<T>) : value is T {
    return !!value
}