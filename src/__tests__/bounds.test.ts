import { describe, it, expect } from "bun:test";

import { Mulberry32Engine } from "../engine/Mulberry32Engine";
import type { RngEngine } from "../engine/RngEngine";
import { MersenneTwisterEngine } from "../engine/MersenneTwisterEngine";
import { XORShift128PlusEngine } from "../engine/XORShift128PlusEngine";
import { Xoshiro256Engine } from "../engine/Xoshiro256Engine";

describe("bounds", () => {
  it("bounds", () => {
    const seed = 1234;
    const engines: Record<string, RngEngine> = {
      Mulberry32: new Mulberry32Engine(seed),
      XORShift128Plus: new XORShift128PlusEngine(seed),
      MersenneTwister: new MersenneTwisterEngine(seed),
      Xoshiro256: new Xoshiro256Engine(seed),
    };
    for (const [name, engine] of Object.entries(engines)) {
      for (let i = 0; i < 10000; i++) {
        const value = engine.next();
        expect(
          value,
          `bounds: engine-> ${name} failed greater than or equal to 0`,
        ).toBeGreaterThanOrEqual(0);
        expect(value, `bounds: engine-> ${name} failed less than 1`).toBeLessThan(1);
      }
      console.log(`${name} successful`);
    }
  });

  // The 64-bit engines must stay below 1 even when the raw output is the
  // maximum uint64. Each test builds a state that yields exactly 2^64 - 1 on
  // the next draw by inverting the generator's output function.
  describe("64-bit engines at maximum raw output", () => {
    const M = 0xffffffffffffffffn;

    it("XORShift128Plus returns < 1", () => {
      // Output is newS1 + s0, where newS1 = g(s1) ^ s0 ^ (s0 >> 26) and
      // g(y) = y' ^ (y' >> 17) with y' = y ^ (y << 23). Choose s0, then solve
      // for s1 so that newS1 = M - s0.
      const s0 = 0x0123456789abcdefn;
      const target = (M - s0) ^ s0 ^ (s0 >> 26n);
      let yPrime = target;
      for (let i = 0; i < 4; i++) yPrime = target ^ (yPrime >> 17n);
      let s1 = yPrime;
      for (let i = 0; i < 3; i++) s1 = yPrime ^ ((s1 << 23n) & M);

      const engine = new XORShift128PlusEngine(0);
      engine.setState(JSON.stringify([s1.toString(), s0.toString()]));
      const value = engine.next();
      expect(value).toBeLessThan(1);
      expect(value).toBeGreaterThan(0.999999);
    });

    it("Xoshiro256 returns < 1", () => {
      // Output is rotl(s1 * 5, 7) * 9; invert each step to get s1.
      const inverse = (a: bigint) => {
        let x = a;
        for (let i = 0; i < 6; i++) x = (x * (2n - a * x)) & M;
        return x;
      };
      const rotr = (x: bigint, k: bigint) => ((x >> k) | (x << (64n - k))) & M;
      const s1 = (rotr((M * inverse(9n)) & M, 7n) * inverse(5n)) & M;

      const engine = new Xoshiro256Engine(0);
      engine.setState(JSON.stringify(["1", s1.toString(), "2", "3"]));
      const value = engine.next();
      expect(value).toBeLessThan(1);
      expect(value).toBeGreaterThan(0.999999);
    });
  });
});
