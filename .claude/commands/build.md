---
description: Implement the next slice using a red-green-refactor loop.
---

Load `test-driven-development` from `.claude/skills/test-driven-development/SKILL.md` and use it for the
implementation loop.

Workflow:

1. Read the spec / pending tasks. Pick the next vertical slice.
2. Write a failing test first (RED). Confirm it fails with a meaningful error.
3. Implement the minimum code to pass (GREEN). Run the full suite.
4. Refactor under test coverage (REFACTOR). Stop when the next change wouldn't earn its complexity.
5. Commit with a message that describes the behavior added, not the file changed.

If a test stays red unexpectedly or the build breaks, switch to `diagnose`
(`.claude/skills/diagnose/SKILL.md`).
