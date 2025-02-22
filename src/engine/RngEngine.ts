export interface RngEngine {
  next(): number;
  getState(): string;
  setState(state: string): void;
}
