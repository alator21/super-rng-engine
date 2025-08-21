import {describe, it, expect} from 'bun:test';
import {createEngine} from '../factory';
import {randomItemFromArray, randomItemsFromArray, randomInRange, randomWithWeights, shuffle} from '../utils';
import type {RngEngine} from '../engine/RngEngine';

const mockEngine = (sequence: number[]): RngEngine => {
  let index = 0;
  return {
    next: () => {
      const value = sequence[index % sequence.length];
      index++;
      return value === 1 ? 0.999999 : value; // Ensure it's in [0,1)
    },
    getState: () => '',
    setState: () => {
    }
  };
};

describe('Factory and Utils', () => {
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

  describe('randomWithWeights', () => {
    type Item = {
      name: string;
      weight: number;
    };

    const sampleItems: Item[] = [
      {name: "A", weight: 10},
      {name: "B", weight: 30},
      {name: "C", weight: 60},
    ];
    it("should respect weights", () => {
      const engine = mockEngine([0.05, 0.2, 0.9]);
      const resultA = randomWithWeights(engine, sampleItems, e => e.weight);
      expect(resultA.name).toBe("A");

      const resultB = randomWithWeights(engine, sampleItems, e => e.weight);
      expect(resultB.name).toBe("B");

      const resultC = randomWithWeights(engine, sampleItems, e => e.weight);
      expect(resultC.name).toBe("C");
    });
    it("should statistically favor higher weights", () => {
      const counts: Record<string, number> = {
        A: 0,
        B: 0,
        C: 0,
      };
      const runs = 10000;
      const engine = createEngine('mersenne-twister')

      for (let i = 0; i < runs; i++) {
        const result = randomWithWeights(engine, sampleItems, e => e.weight);
        counts[result.name]++;
      }
      // C should occur roughly 60% of the time, B ~30%, A ~10%
      expect(counts.C).toBeGreaterThan(counts.B);
      expect(counts.B).toBeGreaterThan(counts.A);
    });

    it("should return last item when weights are tiny and cumulative issues occur", () => {
      const engine = mockEngine([1]);
      const tinyWeights = [
        {name: "X", weight: 1e-10},
        {name: "Y", weight: 1e-10},
        {name: "Z", weight: 1e-10},
      ];
      const result = randomWithWeights(engine, tinyWeights, e => e.weight);
      expect(result.name).toBe("Z");
    });
    it("should throw with empty array", () => {
      const engine = createEngine('mersenne-twister')

      expect(() => randomWithWeights(engine, [], () => 1)).toThrow("Can't get an item from an empty array");
    });
    it("should return last item if all weights are 0 (fallback)", () => {
      const engine = createEngine('mersenne-twister')
      const items = [
        {name: "X", weight: 0},
        {name: "Y", weight: 0},
        {name: "Z", weight: 0},
      ];
      const result = randomWithWeights(engine, items, i => i.weight);
      expect(result.name).toBe("Z");
    });
  });

  describe('shuffle', () => {
    it('should not modify the original array', () => {
      const engine = mockEngine([0.5, 0.2, 0.8]);
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      const shuffled = shuffle(engine, original);
      
      expect(original).toEqual(originalCopy);
      expect(shuffled).not.toBe(original);
    });

    it('should return an array with the same length', () => {
      const engine = mockEngine([0.1, 0.9, 0.5]);
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(engine, arr);
      
      expect(shuffled).toHaveLength(arr.length);
    });

    it('should contain all the same elements', () => {
      const engine = mockEngine([0.7, 0.3, 0.6]);
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(engine, arr);
      
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('should handle empty arrays', () => {
      const engine = mockEngine([0.5]);
      const arr: number[] = [];
      const shuffled = shuffle(engine, arr);
      
      expect(shuffled).toEqual([]);
      expect(shuffled).not.toBe(arr);
    });

    it('should handle single element arrays', () => {
      const engine = mockEngine([0.5]);
      const arr = [42];
      const shuffled = shuffle(engine, arr);
      
      expect(shuffled).toEqual([42]);
      expect(shuffled).not.toBe(arr);
    });

    it('should produce different results with different random sequences', () => {
      const arr = [1, 2, 3, 4, 5];
      
      const engine1 = mockEngine([0.9, 0.8, 0.7, 0.6]);
      const engine2 = mockEngine([0.1, 0.2, 0.3, 0.4]);
      
      const shuffled1 = shuffle(engine1, arr);
      const shuffled2 = shuffle(engine2, arr);
      
      expect(shuffled1).not.toEqual(shuffled2);
    });
  });


});
