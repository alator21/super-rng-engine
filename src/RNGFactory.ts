import { MersenneTwisterEngine } from "./engine/MersenneTwisterEngine";
import { Mulberry32Engine } from "./engine/Mulberry32Engine";
import type { RngEngine } from "./engine/RngEngine";
import { XORShift128PlusEngine } from "./engine/XORShift128PlusEngine";

export function createEngine(type: "mulberry32" | "xorshift128plus" | "mersenne-twister", opts: { seed: number } | { state: string }): RngEngine {
  const seed: number = 'seed' in opts ? opts.seed : 100;
  let state: string | undefined = 'state' in opts ? opts.state : undefined;

  let engine: RngEngine;
  if (type === "mulberry32") engine = new Mulberry32Engine(seed);
  else if (type === "xorshift128plus") engine = new XORShift128PlusEngine(seed);
  else if (type === "mersenne-twister") engine = new MersenneTwisterEngine(seed);
  else throw new Error("Unsupported RNG type");

  if (state !== undefined) engine.setState(state);
  return engine;
}


export function randomItemFromArray<T>(engine: RngEngine, arr: Array<T>): T {
  if (arr.length === 0) {
    throw new Error(`Can't get an item from an empty array`);
  }
  const randomIndex = Math.floor(engine.next() * arr.length);
  return arr[randomIndex];
}

export function randomItemsFromArray<T>(
  engine: RngEngine,
  arr: Array<T>,
  numberOfItems: number,
): Array<T> {
  if (numberOfItems <= 0) {
    throw new Error(`You must request for at least 1 item.`);
  }
  if (numberOfItems > arr.length) {
    throw new Error(`You can't request for more items than they array size.`);
  }
  const shuffled = shuffleArray(engine, arr);
  return shuffled.slice(0, numberOfItems);
}


export function randomInRange(
  engine: RngEngine,
  min: number,
  max: number,
): number {
  if (min > max) {
    throw new Error(`Min ${min} is out of range ${max}`);
  }

  return Math.floor(engine.next() * (max - min + 1)) + min;
}

function shuffleArray<T>(engine: RngEngine, arr: T[]) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(engine.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
