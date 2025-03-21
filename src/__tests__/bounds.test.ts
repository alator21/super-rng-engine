import { describe, it, expect } from 'bun:test';

import { Mulberry32Engine } from '../engine/Mulberry32Engine';
import type { RngEngine } from '../engine/RngEngine';
import { MersenneTwisterEngine } from '../engine/MersenneTwisterEngine';
import { XORShift128PlusEngine } from '../engine/XORShift128PlusEngine';

describe('bounds', () => {
  it('bounds', () => {
    const seed = 1234;
    const engines: Record<string, RngEngine> = {
      'Mulberry32': new Mulberry32Engine(seed),
      'XORShift128Plus': new XORShift128PlusEngine(seed),
      'MersenneTwister': new MersenneTwisterEngine(seed),
    }
    for (const [name, engine] of Object.entries(engines)) {
      for (let i = 0; i < 10000; i++) {
        const value = engine.next();
        expect(value, `bounds: engine-> ${name} failed greater than or equal to 0`).toBeGreaterThanOrEqual(0);
        expect(value, `bounds: engine-> ${name} failed less than 1`).toBeLessThan(1);
      }
      console.log(`${name} successful`);
    }
  })
});
