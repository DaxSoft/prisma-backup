export class TaggedError<T extends string> extends Error {
  public readonly _tag: T;
  public readonly cause?: unknown;

  constructor(tag: T, message: string, cause?: unknown) {
    super(message);
    this._tag = tag;
    this.name = tag;
    this.cause = cause;
  }
}
