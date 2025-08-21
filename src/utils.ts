import type {RngEngine} from "./engine/RngEngine";

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

/**
 * Selects a random item from an array based on weighted probabilities.
 *
 * @template T - The type of the items in the array.
 * @param engine - The RNG engine to use for randomness.
 * @param {Array<t>} arr - An array of items to choose from.
 * @param {(item: T) => number} getWeight - A function that returns the weight of an item.
 * @returns {T} - A randomly selected item, based on the weights.
 * @throws An error if the array is empty.
 */
export function randomWithWeights<T>(
  engine: RngEngine,
  arr: Array<T>,
  getWeight: (item: T) => number
): T {
  if (arr.length === 0) {
    throw new Error(`Can't get an item from an empty array`);
  }
  const totalWeight = arr.reduce((sum, item) => sum + getWeight(item), 0);
  const rand = engine.next() * totalWeight;

  let cumulative = 0;
  for (const item of arr) {
    cumulative += getWeight(item);
    if (rand < cumulative) {
      return item;
    }
  }

  return arr[arr.length - 1];
}

/**
 * Shuffles an array using the Fisher-Yates algorithm without modifying the original.
 *
 * @param engine - The RNG engine to use for randomness.
 * @param arr - The array to shuffle (original array is not modified).
 * @returns A new shuffled array.
 */
export function shuffle<T>(engine: RngEngine, arr: Array<T>): Array<T> {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(engine.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}