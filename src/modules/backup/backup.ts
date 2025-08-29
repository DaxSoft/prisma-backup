import { TaggedError } from "../../utils/tagged-error";

export class PrismaBackup extends TaggedError<"PrismaBackup"> {
  constructor() {
    super();
  }
}
