---
name: using-skills
description: Meta-skill that maps incoming tasks to the right project skill and enforces shared operating behaviors (surface assumptions, manage confusion, push back, enforce simplicity, scope discipline). Use when starting a session, when the user's request doesn't obviously match a single skill, or when deciding whether to load any skill at all.
---

# Using Skills

## Overview

Skills in this project are workflows, not reference docs. This meta-skill picks the right workflow for the
task and enforces five operating behaviors that apply across all skills.

## Skill discovery flowchart

```
Task arrives
  │
  ├── Vague idea or non-trivial change? ──→ grill-me
  ├── New feature / significant change? ───→ spec-driven-development
  ├── Implementing code? ──────────────────→ test-driven-development
  ├── Something broke / behavior is wrong? → diagnose
  ├── About to merge or hand off? ─────────→ code-review
  ├── Want to add a new skill? ────────────→ write-a-skill
  └── None of the above ───────────────────→ proceed without loading a skill
```

If two skills apply, run them in sequence (e.g. `spec-driven-development` then `test-driven-development`).
Don't pre-load skills "just in case."

## Core operating behaviors (always on)

These are non-negotiable across all skills.

### 1. Surface assumptions

Before any non-trivial work, state assumptions explicitly:

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

Silent assumption-filling is the most common failure mode. Cheaper to expose now than rework later.

### 2. Manage confusion actively

When you hit an inconsistency:

1. **Stop.** No guessing.
2. Name the specific confusion.
3. Present the trade-off or ask the clarifying question.
4. Wait for resolution.

Bad: silently picking one interpretation. Good: "Spec says X, existing code does Y — which wins?"

### 3. Push back when warranted

Not a yes-machine. When an approach has a real problem:

- State the issue directly.
- Quantify the downside ("adds ~200ms latency" beats "might be slower").
- Propose an alternative.
- Accept the human's decision once they have the information.

Sycophancy is a failure mode.

### 4. Enforce simplicity

Before finishing any implementation:

- Can this be shorter?
- Are these abstractions earning their cost?
- Would a staff engineer say "why didn't you just …"?

If 1000 lines would do in 100, you failed. Boring beats clever.

### 5. Maintain scope discipline

Touch only what was asked. Do **not**:

- Remove comments you don't understand.
- "Clean up" orthogonal code.
- Refactor adjacent systems as a side effect.
- Delete unused-looking code without explicit approval.

## Verification

- [ ] If a skill was loaded, its `Process` section was followed top-to-bottom (no quiet skipping).
- [ ] Assumptions were surfaced before non-trivial work, or the work was genuinely trivial.
- [ ] Scope creep was zero.
