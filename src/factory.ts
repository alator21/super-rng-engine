import {MersenneTwisterEngine} from "./engine/MersenneTwisterEngine";
import {Mulberry32Engine} from "./engine/Mulberry32Engine";
import type {RngEngine} from "./engine/RngEngine";
import {XORShift128PlusEngine} from "./engine/XORShift128PlusEngine";
import {generateSeed} from "./seed";

type EngineType = "mulberry32" | "xorshift128plus" | "mersenne-twister"

/**
 * Creates a random number generator (RNG) engine based on the specified type.
 *
 * @param type - The type of RNG engine to create. Supported values: `"mulberry32"`, `"xorshift128plus"`, `"mersenne-twister"`.
 * @param seed - Optional.The starting seed of the engine.
 * @returns An instance of an `RngEngine` matching the requested type.
 */
export function createEngine(
  type: EngineType,
  seed?: string
): RngEngine {
  return createEngineInternal(type, seed);
}

/**
 * Creates a random number generator (RNG) engine based on the specified type.
 *
 * @param type - The type of RNG engine to create. Supported values: `"mulberry32"`, `"xorshift128plus"`, `"mersenne-twister"`.
 * @param state - The previously saved state of the engine.
 * @returns An instance of an `RngEngine` matching the requested type.
 */
export function createEngineWithState(
  type: EngineType,
  state: string
): RngEngine {
  const engine = createEngineInternal(type);
  engine.setState(state);
  return engine;
}

function createEngineInternal(
  type: EngineType,
  possibleSeed?: string
): RngEngine {
  const seed = generateSeed(possibleSeed);
  switch (type) {
    case "mulberry32":
      return new Mulberry32Engine(seed);
    case "xorshift128plus":
      return new XORShift128PlusEngine(seed);
    case "mersenne-twister":
      return new MersenneTwisterEngine(seed);
  }
}