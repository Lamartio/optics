import {Lens, Mask, OpticType} from "./Optic";
import {Option} from "./Option";
import {optionOf, optionOfNone} from "./Option+factories";

export function lensOf<S, F>(select: (source: S) => F, copy: (source: S, focus: F) => S): Lens<S, F> {
    return {type: OpticType.Lens, select, copy}
}

export function lensOfKey<S extends {}, K extends keyof S>(key: K): Lens<S, S[K]> {
    return lensOf(
        source => source[key],
        (source, focus) => ({...source, ...{key: focus}})
    )
}

export function maskOf<S, F>(select: (source: S) => Option<F>, copy: (source: S, focus: F) => S): Mask<S, F> {
    return {type: OpticType.Mask, select, copy}
}

export function maskOfKey<S extends Record<K, Option<F>>, K extends keyof S, F>(key: K): Mask<S, F> {
    return maskOf(
        source => source[key],
        (source, focus) => ({...source, ...{key: optionOf(focus)}})
    )
}

export function maskOfGuard<S, F extends S>(predicate: (source: S) => source is F): Mask<S, F> {
    return maskOf(
        source => predicate(source) ? optionOf(source) : optionOfNone(),
        (_, focus) => focus
    )
}
