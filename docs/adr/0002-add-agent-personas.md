# ADR-0002 — Add agent personas and AGENTS.md

Status: accepted
Date: 2026-05-11
Supersedes: none. Extends ADR-0001.

## Context

ADR-0001 deferred `.claude/agents/` ("add when first review skill calls for a fresh-context auditor").
That bar is now met:

- The `code-review` skill in v1 wants a fresh-context reviewer for honest verdicts.
- The user requested upfront architectural scaffolding to plan large structural moves (system reminder
  surfaced scattered x402 code spread across `src/lib/`, `src/routes/`, `src/data/` — an architectural
  question that benefits from a specialist persona).
- Pre-emptive scaffolding is cheaper now than adding it ad-hoc later when 5+ sessions need it.

## Decision

Adopt **two structural additions**:

### 1. `.claude/agents/<name>.md` — Claude-native subagent personas

Four personas seeded:

| Agent | Pairs with | Why this set |
|-------|-----------|--------------|
| `code-reviewer` | `code-review` skill / `/review` | Honest final review. Avoids self-review blind spots. |
| `test-engineer` | `test-driven-development` skill | Test strategy auditing — "do these tests actually constrain behavior?" |
| `security-auditor` | (future security skill) | Trust-boundary review for auth/secrets/input validation. |
| `architect` | (future architecture skill) | Structural decisions, module boundaries, refactor sequencing. |

Personas are **perspectives with stable system prompts**, distinct from **skills which are workflows with
steps**. A persona stays loaded for the duration of one Agent dispatch; a skill is invoked when its
trigger fires.

### 2. `AGENTS.md` at the repo root — tool-agnostic entry doc

Three reasons:

1. Establishes the **multi-tool convention** addyosmani uses — when we later support Cursor / Codex /
   Gemini CLI / Copilot / Windsurf / Kiro / OpenCode, those tools have a single entry point that points
   them at the persona files.
2. Documents the **dispatch contract** (when to invoke a subagent, when not to).
3. Provides a per-tool table for adapting the personas to non-Claude tools (each tool's rules file is
   different, but the persona body is reusable).

## Conflict re-evaluation (vs ADR-0001's deferral list)

ADR-0001 deferred `.claude/agents/` and AGENTS.md. The trigger for un-deferral has fired. ADR-0001's
other deferrals (hooks, top-level `references/` checklists, `plugin.json` / `marketplace.json`) remain
deferred — none of them have a similar trigger yet.

## Layout (additions only)

```
flowagent/
├── AGENTS.md                          # NEW — multi-tool entry doc
└── .claude/
    └── agents/                        # NEW — subagent personas
        ├── code-reviewer.md
        ├── test-engineer.md
        ├── security-auditor.md
        └── architect.md
```

`CLAUDE.md` updated to:
- list the four agents in a discovery table,
- note `.claude/agents/<name>.md` in the conventions section,
- note `AGENTS.md` as the multi-tool entry doc.

## Why not put agents at top-level `agents/` like addyosmani?

addyosmani's top-level `agents/` is referenced from `.claude-plugin/plugin.json` (`agents: [...]`). flowagent
deliberately skipped `plugin.json` (per ADR-0001 — we're not distributing as a plugin). Without that
manifest, Claude Code looks at `.claude/agents/` natively. Putting personas at top-level would require
either duplication or symlinks. KISS: keep them where Claude reads them, and let `AGENTS.md` direct
non-Claude tools to the same files.

If flowagent is ever published as a Claude plugin, we'll add `plugin.json` referencing
`./.claude/agents/*.md` (Claude Code accepts that path). No restructure needed.

## Consequences

- New skills that have a paired persona should reference the persona in their "When to escalate" section
  if they have one.
- When adding a new agent: follow the steps in `AGENTS.md` ("Adding a new agent") and check whether a
  paired skill exists or should be drafted alongside it.
- If we add a non-Claude tool to the project, AGENTS.md is the place to document the dispatch path. No
  per-tool config files until that tool is actually in use.
