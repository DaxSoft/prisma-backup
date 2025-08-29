import { TaggedError } from '../../utils/tagged-error';

export class PrismaRestoreError extends TaggedError<'PrismaRestoreError'> {
  constructor(cause?: unknown) {
    super('PrismaRestoreError', 'A prisma-restore error occurred', cause);
  }
}

export class PrismaInsertionOrderError extends TaggedError<'PrismaInsertionOrderError'> {
  constructor(cause?: unknown) {
    super('PrismaInsertionOrderError', 'A error occured when trying to get the insertion order', cause);
  }
}

export class PrismaInsertModelError extends TaggedError<'PrismaInsertModelError'> {
  constructor(cause?: unknown) {
    super('PrismaInsertModelError', 'A error occured when trying to insert the model', cause);
  }
}
