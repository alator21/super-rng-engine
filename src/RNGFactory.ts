import { MersenneTwisterEngine } from "./engine/MersenneTwisterEngine";
import { Mulberry32Engine } from "./engine/Mulberry32Engine";
import type { RngEngine } from "./engine/RngEngine";
import { XORShift128PlusEngine } from "./engine/XORShift128PlusEngine";

export class RNGFactory {
  static createEngine(type: "mulberry32" | "xorshift128plus" | "mersenne-twister", opts: { seed: number } | { state: string }): RngEngine {
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
}
