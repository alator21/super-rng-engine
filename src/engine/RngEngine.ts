/**
 * The identifiers of the RNG algorithms supported by this library.
 */
export type EngineType = "mulberry32" | "xorshift128plus" | "mersenne-twister";

/**
 * An interface for a random number generator (RNG) engine.
 * Implementations must provide deterministic random number generation
 * with state management capabilities.
 */
export interface RngEngine {
  /**
   * The algorithm this engine instance implements.
   */
  readonly type: EngineType;

  /**
   * Generates the next random number in the range [0, 1).
   *
   * @returns A pseudorandom number in the range [0, 1).
   */
  next(): number;

  /**
   * Retrieves the current state of the RNG as a serialized string.
   * This allows saving and restoring the RNG's state for reproducibility.
   *
   * @returns A string representing the RNG's internal state.
   */
  getState(): string;

  /**
   * Restores the RNG's state from a serialized string.
   * The string should be one previously obtained from `getState()`.
   *
   * @param state - A string representing a previously saved RNG state.
   * @throws An error if the state format is invalid.
   */
  setState(state: string): void;
}
