import type { RngEngine } from "./RngEngine";

export class XORShift128PlusEngine implements RngEngine {
  private state: [bigint, bigint];
  private static readonly MASK_64BIT = 0xFFFFFFFFFFFFFFFFn;

  constructor(seed: number) {
    if (seed === 0) {
      throw new Error("Seed value cannot be zero.");
    }
    const seedBigInt = BigInt(seed) & XORShift128PlusEngine.MASK_64BIT;
    this.state = [seedBigInt, (seedBigInt ^ 0x9E3779B97F4A7C15n) & XORShift128PlusEngine.MASK_64BIT];
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
    return JSON.stringify(this.state.map(n => n.toString()));
  }
  g() {
    return this.state
  }

  setState(state: string): void {
    const parsed = JSON.parse(state);
    if (!Array.isArray(parsed) || parsed.length !== 2) {
      throw new Error("Invalid state format.");
    }
    this.state = [BigInt(parsed[0]) & XORShift128PlusEngine.MASK_64BIT, BigInt(parsed[1]) & XORShift128PlusEngine.MASK_64BIT];
  }
}
