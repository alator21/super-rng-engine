# A simple stateful rng engine

```typescript
import type { createEngine } from '@alator21/super-rng-engine';

const seed = 42;
const engine = createEngine('mulberry32', seed);

const r = engine.next(); // generate a random number between 0 and 1
const state = engine.getState(); // get engine's state(string representation)
```
