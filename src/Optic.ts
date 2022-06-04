import {Option} from "./Option";

export enum OpticType {
    Lens = 'lens',
    Mask = 'mask'
}

export type Optic<S, A> = Lens<S, A> | Mask<S, A>

export interface Optickind<S, F> {
    type: OpticType

    copy(source: S, focus: F): S

}

export interface Lens<S, F> extends Optickind<S, F> {
    type: OpticType.Lens

    select(source: S): F
}

export interface Mask<S, F> extends Optickind<S, F> {
    type: OpticType.Mask

    select(source: S): Option<F>
}

export function isLens<S, A>(optic: Optickind<S, A>): optic is Lens<S, A> {
    return optic.type === OpticType.Lens
}

export function isMask<S, A>(optic: Optickind<S, A>): optic is Mask<S, A> {
    return optic.type === OpticType.Mask
}
