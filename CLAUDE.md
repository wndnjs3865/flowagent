# flowagent — Claude Code Configuration

> Project-level guide. Read first every session.

## What this project is

Placeholder — fill in once domain is locked. Context detected from session start: Agent Economy / x402 stack
(adjacent project: `freetier-sentinel`). This folder is independent; do not assume cross-project state.

When the domain firms up, capture it in `CONTEXT.md` (ubiquitous language) and architecture decisions in
`docs/adr/`.

## Operating philosophy

Synthesized from three sources (see `docs/adr/0001-claude-config-baseline.md` for the synthesis rationale):

1. **Align before you code** (mattpocock) — Run `grill-me` whenever the request is non-trivial. Surface
   assumptions explicitly. Don't fill ambiguity with guesses.
2. **Lifecycle discipline** (addyosmani) — Phases: define → plan → build → verify → review → ship. Each phase
   has a skill. Don't skip phases for "simple" work.
3. **Anti-rationalization** (addyosmani) — When you catch yourself thinking "I'll add tests later" or "this is
   simple enough to skip the spec," that's the signal you need the skill, not the signal you can skip it.
4. **Small and composable** (mattpocock) — Skills are workflows, not frameworks. Adapt them. Don't let
   process own you.
5. **Production-grade** (anthropics/financial-services) — Outputs are staged for human sign-off. Formulas
   over hardcodes. Verify at each stage. MCP-first for external data when available.

## Skill discovery

When a task arrives, identify what you're doing and load the matching skill:

| Doing | Skill |
|-------|-------|
| Vague idea, need alignment | `grill-me` |
| Defining a new feature/change | `spec-driven-development` |
| Implementing code | `test-driven-development` |
| Something broke | `diagnose` |
| Reviewing before merge | `code-review` |
| Writing a new skill | `write-a-skill` |
| Don't know which skill | `using-skills` (meta) |

Commands are entry points: `/grill`, `/spec`, `/build`, `/review`. They activate the right skill(s).

## Specialist agents (subagent personas)

Skills are workflows; agents are perspectives. Dispatch a subagent via the Agent tool when you want a
fresh-context specialist opinion or want to parallelize independent reviews.

| Agent | When to dispatch |
|-------|------------------|
| `code-reviewer` | Final review before merge. Pairs with `/review` and `code-review` skill. |
| `test-engineer` | Test strategy / coverage audit. Pairs with `test-driven-development`. |
| `security-auditor` | Auth, secrets, input validation, OWASP review. Run at trust boundaries. |
| `architect` | Module boundaries, refactor strategy, structural design decisions. |

See `AGENTS.md` for the full dispatch contract (including how non-Claude tools can use these personas).

## Conventions

- **Skill files**: `.claude/skills/<name>/SKILL.md` (flat, no buckets until 13+ skills)
- **Agent files**: `.claude/agents/<name>.md` (Claude-native subagent personas)
- **Frontmatter**: `name` + `description` only. Description = third-person + "Use when …" trigger,
  ≤1024 chars.
- **Supporting files**: only when content exceeds 100 lines. Keep them inside the skill directory.
- **Commands**: `.claude/commands/<name>.md` — slash actions the user invokes explicitly.
- **CONTEXT.md**: ubiquitous-language dictionary at repo root. Keep terse — definitions, not essays.
- **AGENTS.md**: tool-agnostic agent entry doc (read by Cursor/Codex/Gemini/Copilot/etc.).
- **ADRs**: `docs/adr/NNNN-kebab-name.md` — decisions that survive code rewrites.

## Non-negotiables

- **No invented files or symbols.** If you'd recommend a path, function, or flag — grep first.
- **Edit existing before creating new.** Especially `CLAUDE.md`, `CONTEXT.md`, existing skills.
- **No backwards-compat shims for code that hasn't shipped yet.** This is a pre-D-1 project; YAGNI hard.
- **Surface assumptions before non-trivial work.** Use the "ASSUMPTIONS / Correct me now" pattern from
  `using-skills`.
- **Domain isolation.** Adjacent project context (freetier-sentinel, PH launch, x402 health) is loaded by the
  hook but does NOT apply here unless flowagent explicitly takes on related work.

## Adding a new skill

`/write-a-skill` walks through it. Short version: pick a name (kebab-case), write `SKILL.md` with the
frontmatter and 6-section template (`docs/skill-anatomy.md`), keep it under 100 lines, drop supporting files
inside the directory if you need them.
