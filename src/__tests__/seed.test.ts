import { describe, it, expect } from 'bun:test';
import { generateSeed } from '../seed';

describe('seed', () => {

  it('should return a random seed if one is not provided', () => {
    const seed = generateSeed();
    expect(seed).toBeNumber();
  });

  it('should return the hashed number of the string provided', () => {
    const seed = generateSeed('test1');
    expect(seed).toBeNumber();
  });
  it('should return the same seed when providing the same string', () => {
    const seed = generateSeed('test1');
    const seed2 = generateSeed('test1');
    expect(seed).toEqual(seed2);
  });

  it('should return different seeds when providing different strings', () => {
    const seed = generateSeed('test1');
    const seed2 = generateSeed('test2');
    expect(seed).not.toEqual(seed2);
  });

});
