// FNV-1a 32-bit hash: http://www.isthe.com/chongo/tech/comp/fnv/
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function hashStringToNumber(str: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0; // convert to unsigned
}

/**
 * Derives a numeric seed from an optional string, or generates a random one.
 *
 * Note: the string hash (FNV-1a, 32-bit) is not cryptographic or
 * collision-resistant. It guarantees the same string always maps to the
 * same seed, not that distinct strings map to distinct seeds.
 */
export function generateSeed(possibleSeed?: string): number {
  if (possibleSeed === undefined) {
    return Math.floor(Math.random() * 0xffffffff);
  }
  return hashStringToNumber(possibleSeed);
}
