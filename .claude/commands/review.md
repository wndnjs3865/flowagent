---
description: Five-axis review pass on the current change before merge.
---

Load `code-review` from `.claude/skills/code-review/SKILL.md` and run the full process on the current diff
(staged + unstaged, or the PR if one is open).

Steps:

1. Read the spec or PR description first.
2. Walk the diff end-to-end once without writing comments.
3. Pass on each axis: correctness, design, simplicity, tests, ops & security.
4. Sort findings as Blocking / Should-fix / Nit.
5. Summarize at the top: overall verdict + counts.

If a finding requires deeper investigation (e.g. an inconsistency you can't explain from the diff alone),
switch to `diagnose`.
