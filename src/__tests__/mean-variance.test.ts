import { describe, it, expect } from 'bun:test';

import { Mulberry32Engine } from '../Mulberry32Engine';
import type { RngEngine } from '../RngEngine';
import { MersenneTwisterEngine } from '../MersenneTwisterEngine';
import { XORShift128PlusEngine } from '../XORShift128PlusEngine';

describe('mean variance', () => {
  it('mean variance', () => {
    const seed = 1234;
    const engines: Record<string, RngEngine> = {
      'Mulberry32': new Mulberry32Engine(seed),
      'XORShift128Plus': new XORShift128PlusEngine(seed),
      'MersenneTwister': new MersenneTwisterEngine(seed),
    }
    for (const [name, engine] of Object.entries(engines)) {
      const samples = Array.from({ length: 100000 }, () => engine.next());

      const mean = samples.reduce((sum, n) => sum + n, 0) / samples.length;
      const variance = samples.reduce((sum, n) => sum + (n - mean) ** 2, 0) / samples.length;
      expect(Math.abs(mean - 0.5), `mean variance: engine-> ${name} failed`).toBeLessThan(0.01);
      expect(Math.abs(variance - 1 / 12), `mean variance: engine-> ${name} failed`).toBeLessThan(0.01);
      console.log(`${name} successful`);
    }
  })
});
