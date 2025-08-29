import { TaggedError } from '../../utils/tagged-error';

export class PrismaBackupError extends TaggedError<'PrismaBackup'> {
  constructor(cause?: unknown) {
    super('PrismaBackup', 'A prisma-backup error occurred', cause);
  }
}

export class PrismaBackupGetAllTableNameError extends TaggedError<'PrismaBackupGetAllTableNameError'> {
  constructor(cause?: unknown) {
    super(
      'PrismaBackupGetAllTableNameError',
      'A error occured when trying to fetch the table name and row count from your prisma client.',
      cause
    );
  }
}

export class PrismaBackupSaveTableJsonError extends TaggedError<'PrismaBackupSaveTableJsonError'> {
  constructor(cause?: unknown) {
    super(
      'PrismaBackupSaveTableJsonError',
      'A error occured when trying to save the data from the table of the database',
      cause
    );
  }
}

export class PrismaBackupQueryDataError extends TaggedError<'PrismaBackupQueryDataError'> {
  constructor(cause?: unknown) {
    super('PrismaBackupQueryDataError', 'A error occured when trying to query data', cause);
  }
}

export class PrismaBackupTransformDataError extends TaggedError<'PrismaBackupTransformDataError'> {
  constructor(cause?: unknown) {
    super('PrismaBackupTransformDataError', 'A error occured when trying to transform query data', cause);
  }
}

export class PrismaBackupTransformContentError extends TaggedError<'PrismaBackupTransformContentError'> {
  constructor(cause?: unknown) {
    super('PrismaBackupTransformContentError', 'A error occured when trying to transform content data', cause);
  }
}
