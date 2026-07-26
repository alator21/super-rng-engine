/**
 * Thrown when a seed passed to an engine constructor is invalid
 * (e.g. wrong type, non-integer, or a value the algorithm can't use).
 */
export class InvalidSeedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSeedError";
  }
}

/**
 * Thrown when a state string passed to `setState()` is malformed
 * or doesn't match the shape the engine expects.
 */
export class InvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateError";
  }
}
