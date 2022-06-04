import {Certain, SourceType, Uncertain, Update} from "./Source";
import {Option} from "./Option";
import {isFunction} from "./index";
import {lensOfKey, maskOfGuard} from "./Optic+factories";
import {Lens, Mask} from "./Optic";

export function certainOf<S>(get: () => S, set: (value: S) => void): Certain<S> {
    let wrappedSet: (update: Update<S>) => void = value => isFunction(value) ? set(value(get())) : set(value)

    function composeLens<F>(lens: Lens<S, F>): Certain<F> {
        return certainOf(
            () => lens.select(get()),
            focus => set(lens.copy(get(), focus))
        )
    }

    function composeMask<F>(mask: Mask<S, F>): Uncertain<F> {
        return uncertainOf(
            () => mask.select(get()),
            focus => set(mask.copy(get(), focus))
        )
    }

    return {
        type: SourceType.Certain,
        get,
        set: wrappedSet,
        composeLens,
        composeMask,
        compose: key => composeLens(lensOfKey(key)),
        guard: predicate => composeMask(maskOfGuard(predicate)),
        asTuple: () => [get, wrappedSet]
    }
}

export function uncertainOf<S>(get: () => Option<S>, set: (value: S) => void): Uncertain<S> {

    function wrappedSet(value: Update<S>): void {
         isFunction(value)
            ? get().map(source => set(value(source)))
            : set(value)
    }

    function composeLens<F>(lens: Lens<S, F>): Uncertain<F> {
        return uncertainOf(
            () => get().map(lens.select),
            focus => get().map(source => set(lens.copy(source, focus)))
        )
    }

    function composeMask<F>(mask: Mask<S, F>): Uncertain<F> {
        return uncertainOf(
            () => get().flatMap(mask.select),
            focus => get().map(source => set(mask.copy(source, focus)))
        )
    }

    return {
        type: SourceType.Uncertain,
        get,
        set: wrappedSet,
        composeLens,
        composeMask,
        compose: key => composeLens(lensOfKey(key)),
        guard: predicate => composeMask(maskOfGuard(predicate)),
        asTuple: () => [get, wrappedSet]
    }
}
