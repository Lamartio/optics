import {isFunction, run, pipe, Nullable} from "./index";
import {Option, OptionType} from "./Option";

export function optionOf<T>(value: T): Option<T> {
    return {
        type: OptionType.Some,
        value,
        get: () => value,
        map: transform => run(value, pipe(transform, optionOf)),
        flatMap: transform => transform(value),
        fold: (_, ifSome) => ifSome(value)
    }
}

export function optionOfNone<T>(): Option<T> {
    return {
        type: OptionType.None,
        get: or => isFunction(or) ? or() : or,
        map: optionOfNone,
        flatMap: optionOfNone,
        fold: (ifNone) => ifNone(),
    }
}

export function optionOfNullable<T>(value : Nullable<T>) : Option<T> {
    return value ? optionOf(value) : optionOfNone()
}
