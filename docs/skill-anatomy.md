# Skill Anatomy

> Canonical format for skills in this project. Synthesized from
> [addyosmani/agent-skills/docs/skill-anatomy.md](https://github.com/addyosmani/agent-skills/blob/main/docs/skill-anatomy.md),
> [mattpocock/skills/productivity/write-a-skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/write-a-skill/SKILL.md),
> and [anthropics/financial-services](https://github.com/anthropics/financial-services) skill files.

## File layout

```
.claude/skills/
  <skill-name>/
    SKILL.md              # required — entry point
    <supporting>.md       # optional — only when SKILL.md exceeds 100 lines
    scripts/              # optional — deterministic helpers (validators, formatters)
```

Skill names: `lowercase-kebab-case`. Must match the directory name and the frontmatter `name` field.

## SKILL.md frontmatter (required)

```yaml
---
name: skill-name-with-hyphens
description: Third-person sentence describing what the skill does. Use when [specific trigger conditions].
---
```

Rules:

- `name`: lowercase, hyphen-separated, matches the directory.
- `description`: ≤ 1024 chars. First sentence = what it does. Second sentence = "Use when …" with
  concrete triggers (keywords, contexts, file types). The agent only sees this — it must be enough to
  decide whether to load the skill.
- Do **not** summarize the workflow in `description` — the agent may follow the summary instead of
  loading the file.

## Recommended section template

```markdown
# Skill Title

## Overview
1–2 sentences: what it does, why it matters.

## When to use
- Positive triggers (symptoms, task types).
- When NOT to use (exclusions).

## Process
Numbered steps. Specific, actionable, evidence-based.
("Run `npm test` and verify all tests pass" — not "make sure tests work.")

## Common rationalizations (optional but recommended for workflow skills)
| Rationalization | Reality |
|---|---|
| "I'll add tests later" | The bug you'll ship is cheaper to prevent than to debug in prod. |

## Red flags
- Observable patterns that mean the skill is being violated mid-work.

## Verification
- [ ] Each exit criterion is checkable with evidence (test output, screenshot, diff, build log).
```

Skip sections that don't add value. Don't pad. A 30-line skill is fine if 30 lines is enough.

## Writing principles

1. **Process over knowledge** — skills encode workflows, not reference docs.
2. **Specific over general** — concrete commands beat vague advice.
3. **Anti-rationalization** — every skip-worthy step needs a counter-argument when the rationalization is
   common. For obscure skills you can omit this section.
4. **Progressive disclosure** — keep SKILL.md ≤ 100 lines; spill into supporting files only when needed.
5. **Token-conscious** — every section justifies its presence. If removing it wouldn't change agent
   behavior, remove it.
6. **No time-sensitive info** — version numbers, dates, "as of 2026 Q2" — these rot fast.

## Cross-skill references

Reference other skills by name, don't duplicate content:

```markdown
For writing tests, follow `test-driven-development`. If tests fail, switch to `diagnose`.
```

## When to add a script

`scripts/` is for deterministic operations: validators, formatters, file generators. Scripts save tokens and
prevent the agent from generating slightly-different code each run. Don't put domain logic in scripts —
that belongs in the project's code.
