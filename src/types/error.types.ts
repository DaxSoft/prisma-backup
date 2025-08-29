export type Ok<T> = { readonly _tag: "Ok"; readonly value: T };
export type Err<E> = { readonly _tag: "Err"; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;
export type ResultAsync<T, E> = Promise<Result<T, E>>;
export type ErrorMapper<E> = (error: unknown) => E;
