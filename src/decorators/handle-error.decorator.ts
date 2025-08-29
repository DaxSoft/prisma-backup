import { TaggedError } from '../utils/tagged-error';

// The errorMapper takes the original unknown error and maps it to a specific TaggedError
type ErrorMapper<E extends TaggedError<string>> = (cause: unknown) => E;

export function HandleError<E extends TaggedError<string>>(errorMapper: ErrorMapper<E>) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);

        // Handle async methods (Promises)
        if (result instanceof Promise) {
          return result.catch((cause: unknown) => {
            const taggedError = errorMapper(cause);
            // Step 1: Log the custom error
            console.error(taggedError);
            // Step 2: Throw the custom error to the caller
            throw taggedError;
          });
        }

        // Handle sync methods
        return result;
      } catch (cause) {
        const taggedError = errorMapper(cause);
        // Step 1: Log the custom error
        console.error(taggedError);
        // Step 2: Throw the custom error to the caller
        throw taggedError;
      }
    };

    return descriptor;
  };
}
