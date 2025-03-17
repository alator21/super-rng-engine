import { describe, it, expect } from 'bun:test';

import { Mulberry32Engine } from '../engine/Mulberry32Engine';
import { MersenneTwisterEngine } from '../engine/MersenneTwisterEngine';
import { XORShift128PlusEngine } from '../engine/XORShift128PlusEngine';

describe('determinism', () => {
  describe('Mulberry32', () => {
    it('Same seed produces identical sequences', () => {
      const engine1 = new Mulberry32Engine(42);
      const engine2 = new Mulberry32Engine(42);
      const sequence1 = Array.from({ length: 10 }, () => engine1.next());
      const sequence2 = Array.from({ length: 10 }, () => engine2.next());

      expect(sequence1).toEqual(sequence2);
    })

    it('Different seeds produce different sequences', () => {
      const engine1 = new Mulberry32Engine(42);
      const engine2 = new Mulberry32Engine(50);
      const sequence1 = Array.from({ length: 10 }, () => engine1.next());
      const sequence2 = Array.from({ length: 10 }, () => engine2.next());

      expect(sequence1).not.toEqual(sequence2);
    })

    it('State saving and restoring produces the same sequence', () => {
      const engine1 = new Mulberry32Engine(42);
      Array.from({ length: 10 }, () => engine1.next());

      const savedState = engine1.getState();


      const engine2 = new Mulberry32Engine(42);
      engine2.setState(savedState);

      const continuedSequence1 = Array.from({ length: 5 }, () => engine1.next());
      const continuedSequence2 = Array.from({ length: 5 }, () => engine2.next());

      expect(continuedSequence1).toEqual(continuedSequence2);
    })
  })
  describe('XORShift128Plus', () => {
    it('Same seed produces identical sequences', () => {
      const engine1 = new XORShift128PlusEngine(42);
      const engine2 = new XORShift128PlusEngine(42);
      const sequence1 = Array.from({ length: 10 }, () => engine1.next());
      const sequence2 = Array.from({ length: 10 }, () => engine2.next());

      expect(sequence1).toEqual(sequence2);
    })

    it('Different seeds produce different sequences', () => {
      const engine1 = new XORShift128PlusEngine(42);
      const engine2 = new XORShift128PlusEngine(50);
      const sequence1 = Array.from({ length: 10 }, () => engine1.next());
      const sequence2 = Array.from({ length: 10 }, () => engine2.next());

      expect(sequence1).not.toEqual(sequence2);
    })

    it('State saving and restoring produces the same sequence', () => {
      const engine1 = new XORShift128PlusEngine(42);
      Array.from({ length: 10 }, () => engine1.next());

      const savedState = engine1.getState();
      const engine2 = new XORShift128PlusEngine(42);
      engine2.setState(savedState);
      const continuedSequence1 = Array.from({ length: 5 }, () => engine1.next());
      const continuedSequence2 = Array.from({ length: 5 }, () => engine2.next());

      expect(continuedSequence1).toEqual(continuedSequence2);
    })

  })

  describe.only('MersenneTwisterEngine', () => {
    it('Same seed produces identical sequences', () => {
      const engine1 = new MersenneTwisterEngine(42);
      const engine2 = new MersenneTwisterEngine(42);
      const sequence1 = Array.from({ length: 10 }, () => engine1.next());
      const sequence2 = Array.from({ length: 10 }, () => engine2.next());

      expect(sequence1).toEqual(sequence2);
    })

    it('Different seeds produce different sequences', () => {
      const engine1 = new MersenneTwisterEngine(42);
      const engine2 = new MersenneTwisterEngine(50);
      const sequence1 = Array.from({ length: 10 }, () => engine1.next());
      const sequence2 = Array.from({ length: 10 }, () => engine2.next());

      expect(sequence1).not.toEqual(sequence2);
    })

    it('State saving and restoring produces the same sequence', () => {
      const engine1 = new MersenneTwisterEngine(42);
      Array.from({ length: 10 }, () => engine1.next());

      const savedState = engine1.getState();
      const engine2 = new MersenneTwisterEngine(42);
      engine2.setState(savedState);
      const continuedSequence1 = Array.from({ length: 5 }, () => engine1.next());
      const continuedSequence2 = Array.from({ length: 5 }, () => engine2.next());

      expect(continuedSequence1).toEqual(continuedSequence2);
    })
  });
});
