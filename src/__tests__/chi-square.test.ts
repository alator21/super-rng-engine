import { describe, it, expect } from 'bun:test';

import { Mulberry32Engine } from '../Mulberry32Engine';
import type { RngEngine } from '../RngEngine';
import { MersenneTwisterEngine } from '../MersenneTwisterEngine';
import { XORShift128PlusEngine } from '../XORShift128PlusEngine';

describe('chi-square', () => {
  it('chi-square', () => {
    const seed = 1234;
    const engines: Record<string, RngEngine> = {
      'Mulberry32': new Mulberry32Engine(seed),
      'XORShift128Plus': new XORShift128PlusEngine(seed),
      'MersenneTwister': new MersenneTwisterEngine(seed),
    }
    for (const [name, engine] of Object.entries(engines)) {
      const samples = Array.from({ length: 100000 }, () => engine.next());
      const bins = new Array(10).fill(0);
      samples.forEach(n => bins[Math.floor(n * 10)]++);

      const expected = samples.length / bins.length;
      const chiSquare = bins.reduce((sum, observed) => sum + ((observed - expected) ** 2) / expected, 0);
      const criticalValue = 16.92; // ~Chi-square critical value for df=9, alpha=0.05

      expect(chiSquare, `chi-square: engine-> ${name} failed`).toBeLessThan(criticalValue);
      console.log(`${name} successful`);
    }
  })
});
