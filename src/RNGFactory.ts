import { MersenneTwisterEngine } from "./engine/MersenneTwisterEngine";
import { Mulberry32Engine } from "./engine/Mulberry32Engine";
import type { RngEngine } from "./engine/RngEngine";
import { XORShift128PlusEngine } from "./engine/XORShift128PlusEngine";

export class RNGFactory {
  static createEngine(type: "mulberry32" | "xorshift128plus" | "mersenne-twisster", seed: number, state?: string): RngEngine {
    let engine: RngEngine;
    if (type === "mulberry32") engine = new Mulberry32Engine(seed);
    else if (type === "xorshift128plus") engine = new XORShift128PlusEngine(seed);
    else if (type === "mersenne-twisster") engine = new MersenneTwisterEngine(seed);
    else throw new Error("Unsupported RNG type");

    if (state) engine.setState(state);
    return engine;
  }
}
