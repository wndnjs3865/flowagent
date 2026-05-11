# ADR-0001 — Claude Code baseline configuration

Status: accepted
Date: 2026-05-11

## Context

The flowagent repo started empty. We needed a Claude Code configuration that:

1. Encodes the right defaults so future sessions don't have to relitigate them.
2. Synthesizes guidance from three well-regarded public sources without internal conflict.
3. Stays minimal — we're on D-1 of an adjacent product launch, so this isn't the moment to ship a
   24-skill marketplace.

Sources reviewed:

- **anthropics/financial-services** — production-grade Cowork plugins and Managed Agent cookbooks. Plugin
  layout: `plugins/agent-plugins/<slug>/.claude-plugin/plugin.json` + bundled `agents/` and `skills/`.
- **addyosmani/agent-skills** — lifecycle skills (define→plan→build→verify→review→ship) with strict
  anti-rationalization sections. Flat `skills/<name>/SKILL.md`. Hooks-driven meta-skill injection.
- **mattpocock/skills** — small composable skills focused on alignment (`grill-me`, `grill-with-docs`),
  TDD, diagnosis, and architecture. Bucketed `skills/<bucket>/<name>/SKILL.md` with `CONTEXT.md` for
  ubiquitous language.

## Conflicts identified

| Axis | FSI | addyosmani | mattpocock | Resolution |
|------|-----|-----------|-----------|------------|
| Skill location | per-plugin bundle | flat | bucketed | **flat** — single project, no buckets until 13+ skills |
| Section template | free-form | strict 6-section | minimal | **6-section as recommended template, not required** |
| References | inside-skill OR top-level | top-level only | inline | **inside-skill** — per-skill self-contained |
| Plugin manifest | required (marketplace) | required | required | **skip** — flowagent is not distributed |
| Hooks | none | session-start meta-skill injector | none | **skip for now** — defer complexity until needed |
| CONTEXT.md | absent | absent | central | **adopted** — low cost, prevents jargon drift |
| ADRs | absent | absent | present | **adopted** — captures decisions that survive rewrites |
| Anti-rationalization tables | absent | required | absent | **recommended, not required** — useful for workflow skills, noise for trivial ones |

## Decision

Layout:

```
flowagent/
├── CLAUDE.md                       # project entry point
├── CONTEXT.md                      # ubiquitous-language glossary
├── .claude/
│   ├── settings.json               # permissions + env
│   ├── skills/<name>/SKILL.md      # flat layout
│   └── commands/<name>.md          # slash commands
└── docs/
    ├── skill-anatomy.md            # canonical skill format
    └── adr/NNNN-*.md               # decision records
```

Skill set v1 (6 skills, intentionally minimal):

- `using-skills` — meta-skill, decides which skill to load
- `grill-me` — alignment before non-trivial work
- `spec-driven-development` — PRD before implementation
- `test-driven-development` — red-green-refactor
- `diagnose` — disciplined debugging loop
- `write-a-skill` — extension point

Commands: `/grill`, `/spec`, `/build`, `/review` as user-facing entry points.

Deferred:

- `.claude/agents/` (personas — add when first review skill calls for a fresh-context auditor)
- `.claude/hooks/` (auto-inject meta-skill — defer; current settings already load skills on demand)
- Top-level `references/` checklists (security, perf, a11y) — fold in when project surface grows
- `plugin.json` / `marketplace.json` — only if flowagent is ever published as a Claude plugin

## Consequences

- New skills follow `docs/skill-anatomy.md` directly. No need to bikeshed format per addition.
- When the project hits 13+ skills, revisit bucketing (`engineering/`, `domain/`, etc.).
- If we later distribute as a plugin, add `.claude-plugin/plugin.json` listing the skill paths — the rest of
  the structure already matches the public convention.
- Anti-rationalization tables remain optional; if reviewers notice agents skipping steps in a specific
  skill, add the table to that skill retroactively.
