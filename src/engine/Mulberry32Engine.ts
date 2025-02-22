import type { RngEngine } from "./RngEngine";

export class Mulberry32Engine implements RngEngine {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed |= 0;
    this.seed = (this.seed + 0x6D2B79F5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  getState(): string {
    return this.seed.toString();
  }

  setState(state: string): void {
    this.seed = parseInt(state, 10);
  }
}
