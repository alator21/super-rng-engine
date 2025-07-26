# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library for stateful random number generation engines. The library provides multiple RNG algorithms (Mulberry32, XORShift128Plus, Mersenne Twister) with state serialization/deserialization capabilities for reproducible randomness.

## Development Commands

- **Run tests**: `bun test` (uses Bun's built-in test runner)
- **Type checking**: `bunx tsc --noEmit` (no build script, TypeScript is configured for bundler mode)
- **Install dependencies**: `bun install`

## Architecture

### Core Components

**RngEngine Interface** (`src/engine/RngEngine.ts`):
- Defines the contract for all RNG engines
- Key methods: `next()`, `getState()`, `setState()`
- All engines must provide deterministic generation with state management

**RNG Engines** (`src/engine/`):
- `Mulberry32Engine.ts` - Fast, simple PRNG
- `XORShift128PlusEngine.ts` - XORShift variant
- `MersenneTwisterEngine.ts` - High-quality PRNG
- Each implements the `RngEngine` interface

**Factory Functions** (`src/factory.ts`):
- `createEngine(type, seed?)` - Creates engine instances
- `createEngineWithState(type, state)` - Restores from saved state

**Utility Functions** (`src/utils.ts`):
- `randomInRange()` - Generate random integers in a range
- `randomItemFromArray()` - Pick random item from array
- `randomItemsFromArray()` - Pick multiple unique items
- `randomWithWeights()` - Weighted random selection

**Seed Management** (`src/seed.ts`):
- Handles seed generation and validation
- Used internally by factory functions

### Testing Strategy

Tests are organized by functionality in `src/__tests__/`:
- `factory-and-utils.test.ts` - Factory functions and utility functions
- `bounds.test.ts`, `uniformity.test.ts`, `chi-square.test.ts` - Statistical validation
- `determinism.test.ts` - Reproducibility verification
- `mean-variance.test.ts` - Distribution analysis
- `seed.test.ts` - Seed handling

Tests use Bun's test runner with mock engines for predictable behavior.

## Key Patterns

- **State Serialization**: All engines support `getState()`/`setState()` for save/restore
- **Type Safety**: Strong TypeScript typing throughout, including generic utility functions
- **Error Handling**: Consistent validation with descriptive error messages
- **Factory Pattern**: Centralized engine creation with type-safe engine selection

## Publishing

Configured for JSR (JavaScript Registry) with exports defined in `jsr.json`. Tests are excluded from published package.