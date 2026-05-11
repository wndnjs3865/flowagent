---
name: grill-me
description: Interview the user about a plan, feature, or design until every branch of the decision tree is resolved and the agent can implement without guessing. Use when the request is vague, when stakes are high, when touching unfamiliar code, or whenever you catch yourself about to fill ambiguity with a guess.
---

# Grill Me

## Overview

Most failures are misalignment, not coding errors. A short grilling session before code is cheaper than a
rewrite after. This skill forces explicit alignment before implementation.

## When to use

- The user's request is more than ~30 minutes of work.
- The request touches a part of the codebase you haven't read yet.
- Multiple interpretations are plausible and they lead to different code.
- The user said "build X" without telling you why or for whom.

**Don't use** for:

- Trivial edits (typo fix, rename, one-line change).
- Requests with an obvious-correct answer.

## Process

1. **Survey the surface.** Read the relevant files and `CONTEXT.md` before asking anything. Walk in informed.
2. **List unknowns.** Privately enumerate every decision the implementation requires that isn't already
   answered by the request or the code.
3. **Ask in batches of 2–4 questions.** Not one at a time (slow), not 10 at a time (overwhelming). Lead
   with the highest-leverage question — the one whose answer changes the most downstream.
4. **Echo back the answer.** After each batch, restate what you heard in your own words. Catch misreads
   immediately.
5. **Surface trade-offs, don't hide them.** When two answers are both defensible, present both with the
   cost of each. Let the user choose with full information.
6. **Stop when the tree is resolved.** When you can write the implementation start-to-finish without
   guessing, stop interviewing and propose the plan.
7. **Record what's worth remembering.** If a term came up that the agent didn't know, add it to
   `CONTEXT.md`. If a decision is non-obvious, draft an ADR.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "I can probably guess what they meant." | The user said "build X" because they have a specific X in mind. You're playing a slot machine with their time. |
| "Asking will slow things down." | The rework when you guessed wrong is 5–20× the time of asking. |
| "This is simple enough not to need alignment." | The "simple" ones are where assumptions diverge most silently. |

## Red flags

- You're about to write code with a comment like "assuming X" — stop and ask.
- You're using a term that doesn't appear in `CONTEXT.md` or the existing code — pin it down.
- The user has answered "yes" three times without follow-up questions — they may be skim-approving.

## Verification

- [ ] Every implementation decision has a corresponding user answer (or an explicit "your call, picking X").
- [ ] New terms are in `CONTEXT.md`.
- [ ] Non-obvious decisions are captured as ADRs or in the PR description.
