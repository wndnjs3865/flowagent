---
name: write-a-skill
description: Create a new skill for this project — gather scope, draft SKILL.md to the project's canonical format, decide on supporting files and scripts, verify with the user. Use when the user wants to write, create, or build a new skill, or when a recurring workflow appears that no existing skill covers.
---

# Write a Skill

## Overview

Skills are reusable workflows. This skill is the meta-process for creating one that matches the project's
conventions (`docs/skill-anatomy.md`).

## Process

1. **Gather scope.** Ask the user:
   - What task or workflow does this skill cover?
   - What triggers it — keywords, file types, situations?
   - Is it process-shaped (steps) or knowledge-shaped (reference)? **Only the first becomes a skill.**
     Knowledge belongs in `docs/` or `CONTEXT.md`.
   - Does it need deterministic helpers (scripts)?

2. **Pick a name.** `lowercase-kebab-case`. Should read as a verb-ish noun ("diagnose", "code-review",
   "test-driven-development"). Avoid clever names.

3. **Draft `SKILL.md`** following `docs/skill-anatomy.md`:
   - Frontmatter: `name`, `description` (third person + "Use when …", ≤ 1024 chars).
   - Sections: Overview → When to use → Process → (optional) Common rationalizations → Red flags →
     Verification.
   - Target ≤ 100 lines. Spill into supporting files only if needed.

4. **Sanity-check the description.** Read it as the only thing the agent will see. Does it tell the agent
   what the skill provides AND when to load it? If not, rewrite.

5. **Review with the user.**
   - "Here's the draft. Does it cover your case? Anything missing? Any section over-detailed?"
   - Iterate. Don't over-iterate — two passes usually.

6. **Place it.** Create `.claude/skills/<name>/SKILL.md`. If supporting files exist, place them in the
   same directory.

7. **Smoke-test.** Trigger the skill via a realistic task. Watch whether the agent follows the process
   without you having to re-prompt mid-flow. If it skips a step, add an anti-rationalization row for that
   step.

## Don't create a skill when

- The workflow only happens once. Just do the work; don't bottle it.
- The "skill" would be advice without steps ("write clean code"). That's not a workflow.
- The behavior already exists in another skill. Cross-reference instead of duplicating.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "I'll write it long and trim later." | Long drafts rarely get trimmed. Start tight. |
| "I'll skip the verification section, it's obvious." | Without checkable exit criteria, the agent never knows when to stop. |
| "Anti-rationalizations are negativity, skip them." | They prevent the agent from talking itself out of the process. The pattern works. |

## Red flags

- The skill description ends in "and more!" — vague triggers don't trigger.
- The Process section reads like a tutorial instead of a checklist.
- The skill is longer than the workflow it describes.

## Verification

- [ ] Frontmatter validates (name matches dir, description is third-person + has "Use when").
- [ ] Process section is numbered steps with verbs.
- [ ] Verification section has checkable items.
- [ ] Skill is referenced in `CLAUDE.md`'s skill-discovery table (if it's a primary skill).
