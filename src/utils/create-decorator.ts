import type { ErrorMapper, ResultAsync } from "../types";
import { err, ok } from "./error";
import { TaggedError } from "./tagged-error";

export function createDecorator<E extends TaggedError<string>>(
  errorMapper: ErrorMapper<E>
) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);

        // Handle async methods
        if (result instanceof Promise) {
          return result
            .then(ok)
            .catch((e: unknown) => err(errorMapper(e))) as ResultAsync<
            unknown,
            E
          >;
        }

        // Handle sync methods
        return ok(result);
      } catch (e) {
        return err(errorMapper(e));
      }
    };

    return descriptor;
  };
}
