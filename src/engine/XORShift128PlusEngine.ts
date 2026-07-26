import type { RngEngine } from "./RngEngine";
import { InvalidSeedError, InvalidStateError } from "../errors";

export class XORShift128PlusEngine implements RngEngine {
  readonly type = "xorshift128plus" as const;
  private state: [bigint, bigint];
  private static readonly MASK_64BIT = 0xffffffffffffffffn;

  /**
   * @param seed - Must be a non-zero integer. A zero seed produces an
   *   all-zero internal state, which makes xorshift128+ degenerate to
   *   always returning 0, so it is rejected.
   */
  constructor(seed: number) {
    if (!Number.isInteger(seed)) {
      throw new InvalidSeedError("Seed value must be an integer.");
    }
    if (seed === 0) {
      throw new InvalidSeedError("Seed value cannot be zero.");
    }
    const seedBigInt = BigInt(seed) & XORShift128PlusEngine.MASK_64BIT;
    this.state = [
      seedBigInt,
      (seedBigInt ^ 0x9e3779b97f4a7c15n) & XORShift128PlusEngine.MASK_64BIT,
    ];
  }

  private xorshift128plus(): bigint {
    let [s1, s0] = this.state;
    this.state[0] = s0;
    s1 ^= (s1 << 23n) & XORShift128PlusEngine.MASK_64BIT;
    this.state[1] = (s1 ^ s0 ^ (s1 >> 17n) ^ (s0 >> 26n)) & XORShift128PlusEngine.MASK_64BIT;
    return (this.state[1] + s0) & XORShift128PlusEngine.MASK_64BIT;
  }

  next(): number {
    return Number(this.xorshift128plus()) / Number(XORShift128PlusEngine.MASK_64BIT + 1n);
  }

  getState(): string {
    return JSON.stringify(this.state.map((n) => n.toString()));
  }

  setState(state: string): void {
    let parsed;
    try {
      parsed = JSON.parse(state);
    } catch {
      throw new InvalidStateError("Invalid state format.");
    }
    if (
      !Array.isArray(parsed) ||
      parsed.length !== 2 ||
      !parsed.every((n: unknown) => typeof n === "string" && /^-?\d+$/.test(n))
    ) {
      throw new InvalidStateError("Invalid state format.");
    }
    this.state = [
      BigInt(parsed[0]) & XORShift128PlusEngine.MASK_64BIT,
      BigInt(parsed[1]) & XORShift128PlusEngine.MASK_64BIT,
    ];
  }
}
