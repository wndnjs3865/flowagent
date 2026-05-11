---
name: code-review
description: Five-axis review pass on a change before merge — correctness, design, simplicity, tests, and ops/security. Use when the user asks for a review, when finishing a feature before opening a PR, or when self-reviewing your own diff.
---

# Code Review

## Overview

A review with axes prevents "looks fine to me" rubber-stamping. Each axis surfaces a different class of
issue. A diff that passes all five is mergeable.

## When to use

- About to open a PR.
- Reviewing a diff (yours or someone else's).
- After a large refactor, before declaring it done.

## Process

1. **Read the spec / PR description first.** What was this supposed to do? You can't judge correctness
   without knowing intent.
2. **Walk the diff once end-to-end** without writing comments. Build a mental model.
3. **Pass on each axis below.** Write findings as you go.
4. **Sort findings by severity:** `Blocking` / `Should-fix` / `Nit / FYI`.
5. **Summarize at the top.** Reviewer-readable: "Overall: <verdict>. Blocking: N. Should-fix: M. Nits: K."

## The five axes

### 1. Correctness

Does it do what the spec says? Check:

- Each acceptance criterion from the spec is met.
- Edge cases (empty input, max input, off-by-one, null, error path).
- State transitions are valid (no half-states left if the call errors mid-way).

### 2. Design

Is the change shaped well?

- Abstractions earn their cost. A new function used once with the same signature inline is overhead.
- Public surface is the minimum needed. Internals stay internal.
- Module boundaries align with `CONTEXT.md`'s domain language.

### 3. Simplicity

Is this the shortest defensible version?

- Three similar lines beats a premature abstraction.
- Comments explain WHY (non-obvious constraint), not WHAT (named identifiers do that).
- No flags or shims for hypothetical futures.

### 4. Tests

Do the tests prove the change works?

- Each new branch has a test that fails without it.
- No test mocks the system-under-test.
- Test names describe the asserted behavior, not the implementation.
- Suite runs without network or unexplained env vars.

### 5. Ops & security

What happens when this runs in production?

- Inputs from external sources (HTTP, files, env) are validated at the boundary.
- Secrets never logged; auth checks at the right layer.
- Error paths don't leak sensitive info or leave resources open.
- Backwards compatibility considered (if this is a breaking change, it's flagged).

## Severity labels

- **Blocking** — must be fixed before merge.
- **Should-fix** — fix or open a follow-up issue.
- **Nit / FYI** — author's choice. Don't litigate.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "Tests pass, ship it." | Tests pass means no regressions in covered code. It does not mean the change is correct. |
| "The author knows the codebase better, defer to them." | Then why have a review? Deference erodes the value of fresh eyes. |
| "It's a small change, full review is overkill." | Small changes ship more often. Bugs in them are proportionally more common, not less. |

## Red flags

- Review comments are all nits, no design or correctness notes — likely a skim.
- "LGTM" within seconds of opening a 500-line diff.
- Author argues each comment instead of fixing or explicitly disagreeing.

## Verification

- [ ] Each axis was walked, even if findings were zero.
- [ ] Findings labeled by severity.
- [ ] Spec acceptance criteria all green.
- [ ] No `Blocking` findings remain at merge time.
