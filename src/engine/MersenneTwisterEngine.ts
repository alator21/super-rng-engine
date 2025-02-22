import type { RngEngine } from "./RngEngine";


export class MersenneTwisterEngine implements RngEngine {
  private MT: Uint32Array;
  private index: number;

  constructor(seed: number = Date.now()) {
    this.MT = new Uint32Array(624);
    this.index = 0;
    this.MT[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      this.MT[i] = (1812433253 * (this.MT[i - 1] ^ (this.MT[i - 1] >>> 30)) + i) >>> 0;
    }
  }

  private generateNumbers(): void {
    for (let i = 0; i < 624; i++) {
      let y = (this.MT[i] & 0x80000000) + (this.MT[(i + 1) % 624] & 0x7fffffff);
      this.MT[i] = this.MT[(i + 397) % 624] ^ (y >>> 1);
      if (y % 2 !== 0) {
        this.MT[i] ^= 0x9908b0df;
      }
    }
  }

  next(): number {
    if (this.index === 0) {
      this.generateNumbers();
    }

    let y = this.MT[this.index];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;

    this.index = (this.index + 1) % 624;

    // Convert to range [0, 1)
    return (y >>> 0) / 4294967296;
  }

  getState(): string {
    return JSON.stringify({ MT: Array.from(this.MT), index: this.index });
  }

  setState(state: string): void {
    try {
      const parsedState = JSON.parse(state);
      if (Array.isArray(parsedState.MT) && parsedState.MT.length === 624 && typeof parsedState.index === 'number') {
        this.MT = new Uint32Array(parsedState.MT);
        this.index = parsedState.index;
      } else {
        throw new Error("Invalid state format");
      }
    } catch (error) {
      throw new Error("Failed to parse state: " + error);
    }
  }
}

