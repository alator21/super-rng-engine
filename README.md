# A simple stateful rng engine

## Warning: i'm not a math guy - Algorithms(including tests) were mostly AI generated/verified.

```typescript
const seed = 42;
const engine = RNGFactory.createEngine('mulberry32',seed);

const r = engine.next();
```
