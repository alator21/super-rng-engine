import { describe, it, expect } from 'bun:test';
import { randomItemFromArray, randomItemsFromArray, randomInRange } from '../RNGFactory';
import type { RngEngine } from '../engine/RngEngine';

const mockEngine = (sequence: number[]): RngEngine => {
  let index = 0;
  return {
    next: () => {
      const value = sequence[index % sequence.length];
      index++;
      return value === 1 ? 0.999999 : value; // Ensure it's in [0,1)
    },
    getState: () => '',
    setState: () => { }
  };
};

describe('RNGFactory', () => {
  describe('randomItemFromArray', () => {
    it('should return a random item from the array', () => {
      const engine: RngEngine = mockEngine([0.1]);
      const arr = ['a', 'b', 'c'];
      expect(randomItemFromArray(engine, arr)).toBe('a');
    });

    it('should throw an error for an empty array', () => {
      const engine = mockEngine([0]);
      expect(() => randomItemFromArray(engine, [])).toThrow("Can't get an item from an empty array");
    });
  });

  describe('randomItemsFromArray', () => {
    it('should return the correct number of random items', () => {
      const engine = mockEngine([0.2, 0.5, 0.8]);
      const arr = [1, 2, 3, 4, 5];
      const result = randomItemsFromArray(engine, arr, 3);
      expect(result).toHaveLength(3);
    });

    it('should throw an error when requesting more items than available', () => {
      const engine = mockEngine([0]);
      expect(() => randomItemsFromArray(engine, [1, 2], 3)).toThrow("You can't request more items than the array size.");
    });

    it('should throw an error when requesting zero or negative items', () => {
      const engine = mockEngine([0]);
      expect(() => randomItemsFromArray(engine, [1, 2, 3], 0)).toThrow("You must request at least 1 item.");
    });
  });

  describe('randomInRange', () => {
    it('should return a random number within the given range', () => {
      const engine = mockEngine([0.5]);
      expect(randomInRange(engine, 10, 20)).toBe(15);
    });

    it('should throw an error if min is greater than max', () => {
      const engine = mockEngine([0]);
      expect(() => randomInRange(engine, 10, 5)).toThrow('Min 10 is out of range 5');
    });

    it('should return min when engine.next() is 0', () => {
      const engine = mockEngine([0]);
      expect(randomInRange(engine, 5, 10)).toBe(5);
    });

    it('should return max when engine.next() is close to 1', () => {
      const engine = mockEngine([0.999]);
      expect(randomInRange(engine, 5, 10)).toBe(10);
    });
    it('should be able to generate both min and max values', () => {
      const engine = mockEngine([0, 1]);
      expect(randomInRange(engine, 1, 10)).toBe(1);
      expect(randomInRange(engine, 1, 10)).toBe(10);
    });
  });

});
