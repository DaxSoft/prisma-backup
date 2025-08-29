import { createDecorator } from '../utils/create-decorator';
import { TaggedError } from '../utils/tagged-error';

export const HandleError = <E extends TaggedError<string>>(errorMapper: (error: unknown) => E) =>
  createDecorator(errorMapper);
