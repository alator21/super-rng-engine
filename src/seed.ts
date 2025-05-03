function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0; // |0 forces 32-bit signed int
  }
  return hash >>> 0; // convert to unsigned
}

export function generateSeed(possibleSeed?: string): number {
  if (possibleSeed === undefined) {
    return Math.floor(Math.random() * 100000);
  }
  return hashStringToNumber(possibleSeed);
}
