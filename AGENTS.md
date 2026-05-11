# AGENTS

> Multi-tool entry point. Any AI coding agent (Claude Code, Cursor, Codex, Gemini CLI, Copilot, Windsurf,
> Kiro, OpenCode) opening this repo should read this file first.

## How this project organizes AI work

```
flowagent/
├── CLAUDE.md                  # primary project guide (read by Claude Code; humans should read too)
├── AGENTS.md                  # this file — tool-agnostic entry point
├── CONTEXT.md                 # ubiquitous-language glossary (domain terms)
├── .claude/
│   ├── settings.json          # Claude Code permissions and env
│   ├── skills/<name>/SKILL.md # workflow skills (Define → Plan → Build → Verify → Review)
│   ├── commands/<name>.md     # slash commands (/grill, /spec, /build, /review)
│   └── agents/<name>.md       # specialist subagent personas (this section's focus)
└── docs/
    ├── skill-anatomy.md       # canonical SKILL format
    └── adr/NNNN-*.md          # architecture decision records
```

Skills are **workflows** (steps the agent follows). Agents are **personas** (perspectives the agent adopts).
Use a skill to decide what to do; dispatch an agent when a task benefits from a fresh-context specialist.

## Available agents

| Agent | Persona | When to dispatch |
|-------|---------|-----------------|
| `code-reviewer` | Senior Staff Engineer | Final review pass before merging. Pairs with the `code-review` skill and `/review` command. |
| `test-engineer` | QA Specialist | Designing a test strategy, auditing coverage, evaluating whether tests prove behavior. |
| `security-auditor` | Security Engineer | Reviewing auth, secrets, input validation, dependency risk, OWASP exposure. |
| `architect` | Principal Engineer | High-level system design, module boundaries, refactor strategy, identifying cross-cutting concerns. |

## Dispatch conventions

### Claude Code

Claude reads `.claude/agents/<name>.md` automatically. Dispatch via the Agent tool with
`subagent_type: <name>`. Use it when:

- You want a **fresh-context** opinion (the agent doesn't see your conversation, only the prompt).
- The work benefits from a **specialist persona** rather than a generalist.
- You want to **parallelize independent reviews** (security + tests + design simultaneously).

Skip subagents for trivial work the main agent can do faster in-line.

### Other tools (Cursor, Codex, Gemini, Copilot, Windsurf, Kiro, OpenCode)

The agent persona files are plain Markdown with frontmatter. Reference them as system prompts or rules:

- **Cursor**: copy the agent body into `.cursor/rules/<name>.mdc`.
- **Codex**: pass the persona file as `--system` or paste into a rules file.
- **Gemini CLI**: install via `gemini agents add ./.claude/agents/<name>.md` (or paste into `GEMINI.md`).
- **Copilot**: copy into `.github/copilot-instructions.md` under a "Persona: <name>" heading.
- **Windsurf / Kiro / OpenCode**: each tool has its own rules location — point it at the persona file.

The persona content is tool-agnostic by design. Frontmatter fields not understood by a given tool can be
ignored — only the body needs to be loaded.

## Adding a new agent

1. Decide if you really need an agent rather than a skill. An agent is a **perspective with a stable
   system prompt**. A skill is a **workflow with steps**. If the work is "follow these steps," it's a skill,
   not an agent.
2. Add `.claude/agents/<name>.md` with frontmatter:
   ```yaml
   ---
   name: <kebab-case>
   description: One sentence — when to dispatch this agent. Include trigger conditions.
   ---
   ```
3. Body: ~50–100 lines. Define the persona, its standards, what it produces, what it refuses.
4. Add a row to the table above.
5. If the agent has a paired skill or command, cross-link both.

## Cross-references

- Skills the agents pair with: `code-review`, `test-driven-development`, `diagnose`,
  `spec-driven-development` (under `.claude/skills/`).
- Commands the agents pair with: `/review`, `/build`, `/spec` (under `.claude/commands/`).
- Decision history: `docs/adr/0001-claude-config-baseline.md`,
  `docs/adr/0002-add-agent-personas.md`.
