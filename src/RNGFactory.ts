import { MersenneTwisterEngine } from "./engine/MersenneTwisterEngine";
import { Mulberry32Engine } from "./engine/Mulberry32Engine";
import type { RngEngine } from "./engine/RngEngine";
import { XORShift128PlusEngine } from "./engine/XORShift128PlusEngine";


/**
 * Creates a random number generator (RNG) engine based on the specified type.
 *
 * @param type - The type of RNG engine to create. Supported values: `"mulberry32"`, `"xorshift128plus"`, `"mersenne-twister"`.
 * @param opts - Configuration options for the RNG engine. Either a seed (`{ seed: number }`) or a saved state (`{ state: string }`).
 * @returns An instance of an `RngEngine` matching the requested type.
 * @throws An error if an unsupported RNG type is provided.
 */
export function createEngine(
  type: "mulberry32" | "xorshift128plus" | "mersenne-twister",
  opts: { seed: number } | { state: string }
): RngEngine {
  const seed: number = "seed" in opts ? opts.seed : 100;
  let state: string | undefined = "state" in opts ? opts.state : undefined;

  let engine: RngEngine;
  if (type === "mulberry32") engine = new Mulberry32Engine(seed);
  else if (type === "xorshift128plus") engine = new XORShift128PlusEngine(seed);
  else if (type === "mersenne-twister") engine = new MersenneTwisterEngine(seed);
  else throw new Error("Unsupported RNG type");

  if (state !== undefined) engine.setState(state);
  return engine;
}

/**
 * Selects a random item from an array using the given RNG engine.
 *
 * @param engine - The RNG engine to use for randomness.
 * @param arr - The array to select an item from.
 * @returns A randomly chosen item from the array.
 * @throws An error if the array is empty.
 */
export function randomItemFromArray<T>(engine: RngEngine, arr: Array<T>): T {
  if (arr.length === 0) {
    throw new Error(`Can't get an item from an empty array`);
  }
  const randomIndex = Math.floor(engine.next() * arr.length);
  return arr[randomIndex];
}

/**
 * Selects multiple unique random items from an array.
 *
 * @param engine - The RNG engine to use for randomness.
 * @param arr - The array to select items from.
 * @param numberOfItems - The number of unique items to select.
 * @returns An array of randomly chosen unique items.
 * @throws An error if the requested number of items is greater than the array size or less than 1.
 */
export function randomItemsFromArray<T>(
  engine: RngEngine,
  arr: Array<T>,
  numberOfItems: number
): Array<T> {
  if (numberOfItems <= 0) {
    throw new Error(`You must request at least 1 item.`);
  }
  if (numberOfItems > arr.length) {
    throw new Error(`You can't request more items than the array size.`);
  }
  if (numberOfItems === arr.length) {
    return [...arr];
  }
  const selectedIndices = new Set<number>();
  const result: Array<T> = [];

  while (selectedIndices.size < numberOfItems) {
    const randomIndex = randomInRange(engine, 0, arr.length - 1);
    if (!selectedIndices.has(randomIndex)) {
      selectedIndices.add(randomIndex);
      result.push(arr[randomIndex]);
    }
  }
  return result;
}

/**
 * Generates a random integer within a specified range.
 *
 * @param engine - The RNG engine to use for randomness.
 * @param min - The minimum value of the range (inclusive).
 * @param max - The maximum value of the range (inclusive).
 * @returns A random integer within the range `[min, max]`.
 * @throws An error if `min` is greater than `max`.
 */
export function randomInRange(
  engine: RngEngine,
  min: number,
  max: number
): number {
  if (min > max) {
    throw new Error(`Min ${min} is out of range ${max}`);
  }

  return Math.floor(engine.next() * (max - min + 1)) + min;
}

