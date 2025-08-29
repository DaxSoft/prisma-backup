import { TaggedError } from "../../utils/tagged-error";

export class PrismaBackupError extends TaggedError<"PrismaBackup"> {
  constructor(cause?: unknown) {
    super("PrismaBackup", "A prisma-backup error occurred", cause);
  }
}
