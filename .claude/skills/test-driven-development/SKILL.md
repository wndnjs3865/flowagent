---
name: test-driven-development
description: Build features and fix bugs using a red-green-refactor loop — write a failing test first, then the minimum code to pass it, then refactor with the test as a safety net. Use whenever implementing logic, fixing a reproducible bug, or changing observable behavior.
---

# Test-Driven Development

## Overview

A failing test before code does two things: proves the test actually tests the behavior, and gives the
agent a tight feedback loop. Without it, agents drift, fabricate, and over-engineer.

## When to use

- Implementing any new logic with branching or state.
- Fixing a bug that's reproducible (write the regression test first).
- Changing behavior of an existing function.

**Don't use** for:

- Pure rename / move refactors with no behavior change (let the existing tests catch breaks).
- UI tweaks where the only meaningful test is visual.
- Spike code you'll throw away (but admit you're spiking — don't merge spikes).

## Process — RED / GREEN / REFACTOR

### RED — write a failing test

1. State in one sentence what the test asserts.
2. Write the test.
3. Run it. **Watch it fail with a meaningful error.** A test that passes immediately is not a test.
4. If the failure message is confusing, fix the test before writing implementation.

### GREEN — minimum code to pass

1. Write the smallest implementation that flips the test green.
2. Resist the urge to handle "obvious other cases" — they get their own RED step.
3. Run the full test suite. Other tests breaking means the change has a wider blast radius than the spec.

### REFACTOR — clean up under cover of tests

1. Now (and only now) reshape the code: rename, extract, deduplicate.
2. Run tests after each refactor step.
3. Stop when the next change would add complexity not pulling its weight.

## Test pyramid

- **80% unit** — fast, deterministic, no I/O. Drive logic here.
- **15% integration** — real DB, real HTTP, but mocked external services. Catch wiring bugs.
- **5% E2E** — full stack. Catch what only happens with everything wired up.

A unit test that hits the network is not a unit test.

## DAMP over DRY (in tests)

Tests that read top-to-bottom beat tests that share helpers across files. Some duplication in test setup
is fine if it makes the failure mode obvious.

## Beyoncé rule

If you liked it, you should have put a test on it. Anything you want to keep working should have a test
guarding it.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "I'll add tests after the code works." | The test you add later tests what the code does, not what it should do. |
| "This is too simple to need a test." | Simple code in a complex system is where regressions hide. |
| "The mocked test passes — ship it." | Mocks pass when prod fails. Integration tests catch wiring. |

## Red flags

- A test was written and passed on the first run with no implementation change.
- A test mocks the very thing it claims to test.
- Test names are vague (`test_function_1`, `it works`).

## Verification

- [ ] Every new branch / state has a test that fails without it.
- [ ] Full suite passes locally.
- [ ] No test mocks the system-under-test.
