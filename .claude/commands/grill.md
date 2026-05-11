---
description: Interview me about the current request until every implementation decision is resolved.
---

Load the `grill-me` skill from `.claude/skills/grill-me/SKILL.md` and run its full process.

Before asking anything, survey the relevant code and read `CONTEXT.md`. Ask in batches of 2–4 questions,
leading with the highest-leverage one. Echo back each answer in your own words. Stop only when you can
implement start-to-finish without guessing.

If a new domain term comes up, append it to `CONTEXT.md`. If a non-obvious decision lands, draft an ADR
under `docs/adr/`.
