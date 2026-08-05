import type { RngEngine } from "./RngEngine";
import { InvalidSeedError, InvalidStateError } from "../errors";

const MASK_64BIT = 0xffffffffffffffffn;

function rotl(x: bigint, k: bigint): bigint {
  return ((x << k) | (x >> (64n - k))) & MASK_64BIT;
}

/**
 * Expands a single 64-bit seed into four 64-bit state words using SplitMix64.
 * This avoids weak/degenerate xoshiro256 states (e.g. the all-zero state)
 * that a naive expansion of a single seed could produce.
 */
function splitMix64States(seed: bigint): [bigint, bigint, bigint, bigint] {
  let state = seed & MASK_64BIT;
  const next = (): bigint => {
    state = (state + 0x9e3779b97f4a7c15n) & MASK_64BIT;
    let z = state;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK_64BIT;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK_64BIT;
    return (z ^ (z >> 31n)) & MASK_64BIT;
  };
  return [next(), next(), next(), next()];
}

export class Xoshiro256Engine implements RngEngine {
  readonly type = "xoshiro256" as const;
  private state: [bigint, bigint, bigint, bigint];

  /**
   * @param seed - Must be an integer. The 64-bit state is derived from the
   *   seed via SplitMix64, which guarantees a non-zero, well-mixed initial
   *   state even for a seed of `0`.
   */
  constructor(seed: number) {
    if (!Number.isInteger(seed)) {
      throw new InvalidSeedError("Seed value must be an integer.");
    }
    this.state = splitMix64States(BigInt(seed) & MASK_64BIT);
  }

  private xoshiro256starstar(): bigint {
    const [s0, s1, s2, s3] = this.state;
    const result = rotl((s1 * 5n) & MASK_64BIT, 7n) * 9n;

    const t = (s1 << 17n) & MASK_64BIT;

    const ns2 = s2 ^ s0;
    const ns3 = s3 ^ s1;
    const ns1 = s1 ^ ns2;
    const ns0 = s0 ^ ns3;

    this.state = [ns0, ns1, (ns2 ^ t) & MASK_64BIT, rotl(ns3, 45n)];

    return result & MASK_64BIT;
  }

  next(): number {
    return Number(this.xoshiro256starstar()) / Number(MASK_64BIT + 1n);
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
      parsed.length !== 4 ||
      !parsed.every((n: unknown) => typeof n === "string" && /^-?\d+$/.test(n))
    ) {
      throw new InvalidStateError("Invalid state format.");
    }
    this.state = parsed.map((n) => BigInt(n) & MASK_64BIT) as [bigint, bigint, bigint, bigint];
  }
}
