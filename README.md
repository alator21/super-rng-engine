# A simple stateful rng engine

```typescript
const seed = 42;
const engine = RNGFactory.createEngine('mulberry32',seed);

const r = engine.next();
```
