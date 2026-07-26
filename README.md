# super-rng-engine

A small, dependency-free TypeScript library for deterministic, stateful pseudo-random number generation.

Pick an algorithm, seed it (or don't), pull numbers from it, and save/restore its exact internal state whenever you need reproducibility — for games, procedural generation, simulations, or tests.

## Features

- **Three RNG engines** — Mulberry32 (fast, simple), XORShift128+ (fast, long period), Mersenne Twister (high statistical quality)
- **State serialization** — every engine can `getState()`/`setState()` to snapshot and resume a sequence exactly
- **String or random seeding** — seed with any string for reproducible runs, or omit it for a random start
- **Small utility set** — ranges, array picks, weighted picks, shuffling, booleans
- **Typed errors** — `InvalidSeedError` / `InvalidStateError` instead of generic `Error`s
- **Zero runtime dependencies**

## Installation

Published on [JSR](https://jsr.io/) as `@alator21/super-rng-engine`.

```sh
bunx jsr add @alator21/super-rng-engine
```

```sh
npx jsr add @alator21/super-rng-engine
```

```sh
deno add jsr:@alator21/super-rng-engine
```

## Quick start

```typescript
import { createEngine } from '@alator21/super-rng-engine';

const engine = createEngine('mulberry32', 'my-seed');

engine.next();  // a pseudorandom number in [0, 1)
engine.next();  // the next one in the sequence
```

The same seed always produces the same sequence:

```typescript
const a = createEngine('mulberry32', 'my-seed');
const b = createEngine('mulberry32', 'my-seed');

a.next() === b.next(); // true
```

Omit the seed for a random starting point:

```typescript
const engine = createEngine('mulberry32');
```

## Choosing an engine

| Type (`EngineType`) | Algorithm        | Notes                                                              |
|----------------------|-------------------|---------------------------------------------------------------------|
| `'mulberry32'`        | Mulberry32        | Fastest, smallest state (a single 32-bit int). Good default for most uses. |
| `'xorshift128plus'`   | XORShift128+      | Fast, longer period than Mulberry32. **Rejects a seed of `0`** (see below). |
| `'mersenne-twister'`  | Mersenne Twister  | Larger internal state, best statistical quality, slower and heavier to serialize. |

```typescript
const engine = createEngine('mersenne-twister', 'my-seed');
```

## Seeding

`createEngine(type, seed?)` accepts an optional **string** seed:

- The same seed string always produces the same numeric seed and the same output sequence.
- Seed strings are hashed with FNV-1a (32-bit). This guarantees determinism, not collision-resistance — it's not a cryptographic hash, so don't rely on distinct seed strings always producing distinct sequences.
- If no seed is given, a random one is generated for you.

```typescript
createEngine('mulberry32', 'level-1-loot'); // same sequence every time
createEngine('mulberry32');                 // different sequence each run
```

`XORShift128PlusEngine` treats a seed of `0` as invalid, because an all-zero internal state makes the algorithm degenerate to always returning `0`:

```typescript
import { createEngine, InvalidSeedError } from '@alator21/super-rng-engine';

try {
  createEngine('xorshift128plus', '');
} catch (e) {
  if (e instanceof InvalidSeedError) {
    // handle a seed the engine can't use
  }
}
```

## Saving and restoring state

Every engine exposes `getState()`/`setState()` so you can persist a sequence and resume it later — exactly where it left off.

```typescript
import { createEngine, createEngineWithState } from '@alator21/super-rng-engine';

const engine = createEngine('mersenne-twister', 'save-me');
engine.next();
engine.next();

const state = engine.getState(); // serialized string, safe to store (file, DB, etc.)

// ...later, possibly in a different process...

const restored = createEngineWithState('mersenne-twister', state);
restored.next(); // continues exactly where `engine` left off
```

`createEngineWithState` needs the same `EngineType` the state was captured from — state formats are not interchangeable between engines. Malformed or mismatched state throws `InvalidStateError`.

```typescript
import { createEngineWithState, InvalidStateError } from '@alator21/super-rng-engine';

try {
  createEngineWithState('mulberry32', someUntrustedString);
} catch (e) {
  if (e instanceof InvalidStateError) {
    // fall back to a fresh engine, log, etc.
  }
}
```

## Utilities

All utilities take an `RngEngine` as their first argument, so they work with any of the three engines interchangeably.

```typescript
import {
  createEngine,
  randomInRange,
  randomFloat,
  randomBoolean,
  randomItemFromArray,
  randomItemsFromArray,
  randomWithWeights,
  shuffle,
} from '@alator21/super-rng-engine';

const engine = createEngine('mulberry32', 'utils-demo');
```

| Function | Signature | Description |
|---|---|---|
| `randomInRange` | `(engine, min, max) => number` | Random **integer** in `[min, max]` (inclusive). |
| `randomFloat` | `(engine, min, max) => number` | Random **float** in `[min, max)`. |
| `randomBoolean` | `(engine, probability = 0.5) => boolean` | Random boolean, `true` with the given probability. |
| `randomItemFromArray` | `(engine, arr) => T` | One random item from an array. |
| `randomItemsFromArray` | `(engine, arr, n) => T[]` | `n` unique random items from an array. |
| `randomWithWeights` | `(engine, arr, getWeight) => T` | One item, chosen with probability proportional to its weight. |
| `shuffle` | `(engine, arr) => T[]` | A new, shuffled copy of the array (Fisher-Yates); the original is untouched. |

```typescript
randomInRange(engine, 1, 6);                 // dice roll: 1-6
randomFloat(engine, 0, 1);                   // e.g. 0.4831...
randomBoolean(engine, 0.25);                 // true ~25% of the time
randomItemFromArray(engine, ['a', 'b', 'c']);
randomItemsFromArray(engine, [1, 2, 3, 4], 2);
shuffle(engine, [1, 2, 3, 4, 5]);

randomWithWeights(
  engine,
  [{ name: 'common', weight: 70 }, { name: 'rare', weight: 30 }],
  (item) => item.weight
);
```

## Error handling

Validation errors are typed, so you can branch on error type instead of parsing messages:

- `InvalidSeedError` — thrown by an engine's constructor when a seed can't be used.
- `InvalidStateError` — thrown by `setState()` (directly, or via `createEngineWithState`) when a state string is malformed or doesn't match the engine.

```typescript
import { InvalidSeedError, InvalidStateError } from '@alator21/super-rng-engine';
```

## API reference

```typescript
type EngineType = 'mulberry32' | 'xorshift128plus' | 'mersenne-twister';

interface RngEngine {
  readonly type: EngineType;
  next(): number;        // pseudorandom number in [0, 1)
  getState(): string;    // serialize current internal state
  setState(state: string): void; // restore from a previously saved state
}

function createEngine(type: EngineType, seed?: string): RngEngine;
function createEngineWithState(type: EngineType, state: string): RngEngine;
```

## License

MIT
