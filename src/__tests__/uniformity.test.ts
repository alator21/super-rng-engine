import { describe, it, expect } from "bun:test";

import { Mulberry32Engine } from "../engine/Mulberry32Engine";
import type { RngEngine } from "../engine/RngEngine";
import { MersenneTwisterEngine } from "../engine/MersenneTwisterEngine";
import { XORShift128PlusEngine } from "../engine/XORShift128PlusEngine";
import { Xoshiro256Engine } from "../engine/Xoshiro256Engine";

describe("uniformity", () => {
  it("uniformity", () => {
    const seed = 1234;
    const engines: Record<string, RngEngine> = {
      Mulberry32: new Mulberry32Engine(seed),
      XORShift128Plus: new XORShift128PlusEngine(seed),
      MersenneTwister: new MersenneTwisterEngine(seed),
      Xoshiro256: new Xoshiro256Engine(seed),
    };
    for (const [name, engine] of Object.entries(engines)) {
      const samples = Array.from({ length: 1000000 }, () => engine.next());
      const bins = Array.from({ length: 10 }, () => 0);
      samples.forEach((n) => bins[Math.floor(n * 10)]++);

      const expected = samples.length / bins.length;
      const tolerance = expected * 0.05;

      bins.forEach((count) => {
        expect(Math.abs(count - expected), `uniformity: engine-> ${name} failed`).toBeLessThan(
          tolerance,
        );
      });
      console.log(`${name} successful`);
    }
  });
});
