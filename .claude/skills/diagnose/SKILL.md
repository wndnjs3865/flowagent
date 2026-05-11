---
name: diagnose
description: Disciplined diagnosis loop for hard bugs, flaky tests, and performance regressions — reproduce, minimize, hypothesize, instrument, fix, then add a regression test. Use when a test is failing, a build is broken, behavior is unexpected, or "it works on my machine" came up.
---

# Diagnose

## Overview

The most expensive debugging time is the time spent guessing. This skill is a loop that replaces guessing
with evidence. Each step produces a smaller, more specific failure case until the cause is obvious.

## When to use

- A test is red and the cause isn't obvious from the error message.
- Behavior is inconsistent ("flaky") or environment-dependent.
- A performance regression has appeared and you don't know which change caused it.

**Don't use** for trivial errors with clear messages — just fix them.

## The loop — Reproduce → Minimize → Hypothesize → Instrument → Fix → Regression-test

### 1. Reproduce

Get a deterministic repro. If it's flaky, run it 100 times. Reproduce locally if at all possible.

- Capture: command, input, environment (Node/Python version, OS, env vars).
- Stop the line if you can't reproduce. Don't guess at fixes for bugs you can't trigger.

### 2. Minimize

Shrink the repro until removing any more would make the bug disappear. Goal: smallest input/code that
triggers the failure.

- Comment out unrelated setup.
- Replace real dependencies with stubs one at a time.
- The minimal repro often makes the cause visible.

### 3. Hypothesize

Write the hypothesis explicitly:

```
Hypothesis: <X> is happening because <Y>. Evidence so far: <Z>.
```

If you have more than one plausible hypothesis, rank them by:

- Cheapest to test (highest first).
- Most consistent with the evidence.

### 4. Instrument

Add the **minimum** instrumentation to distinguish hypotheses:

- Log the actual value, not just "got here."
- Print pre-state and post-state for the suspected mutation.
- For perf: time a single block, not the whole call.

Run. Read evidence. Update or replace the hypothesis. Loop.

### 5. Fix

Only after the hypothesis is confirmed. The fix should be the smallest change that makes the failing case
pass without breaking adjacent cases.

### 6. Regression-test

Add a test that fails without the fix and passes with it. This is non-negotiable — without it, the bug
returns next quarter.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "I think this is the fix, let me just try it." | Trying without a hypothesis is gambling. Each failed try costs more than naming the hypothesis would. |
| "The repro is annoying to set up, I'll skip it." | Bugs you can't reproduce, you can't verify the fix for. |
| "Adding a test for this edge case is overkill." | The bug existed once. It will exist again unless something pins it. |

## Red flags

- "Let me try changing this and see what happens" without a hypothesis.
- Removing instrumentation before the fix is verified.
- Closing the bug without adding a regression test.

## Verification

- [ ] Deterministic repro recorded.
- [ ] Hypothesis confirmed by evidence (not by the fix working).
- [ ] Regression test fails without the fix, passes with it.
- [ ] Adjacent tests still pass.
