---
name: spec-driven-development
description: Write a short PRD covering objective, user, scope, non-goals, structure, and verification before any non-trivial code change. Use when starting a new feature, doing a significant refactor, or making any change a future maintainer would need explanation for.
---

# Spec-Driven Development

## Overview

A short spec written before code prevents the most expensive class of bugs: building the wrong thing. The
spec is the contract between intent and implementation. Keep it tight — a 1-page spec beats a 10-page one
that nobody reads.

## When to use

- New feature.
- Refactor that changes externally observable behavior.
- Any change that adds more than one new file.

**Don't use** for: typo fixes, single-call-site bug fixes, dependency bumps.

## Process

1. **Confirm alignment.** If `grill-me` hasn't already happened and the request is non-trivial, run it
   first.
2. **Draft the spec.** Use the template below. Keep each section to a few lines unless the topic genuinely
   requires more.
3. **Define non-goals explicitly.** What this change does NOT do is as load-bearing as what it does.
4. **Define verification up front.** What evidence shows the spec is satisfied? (Tests passing,
   screenshot, log output, manual demo.) If you can't say, the spec is too vague.
5. **Get explicit user approval before coding.** Don't proceed on assumed approval.

## Spec template

```markdown
# Spec — <feature/change name>

## Objective
One sentence. The result the user can do or observe.

## User / caller
Who triggers this? Internal code, external user, scheduled job?

## In scope
- Bullet list of what this change includes.

## Out of scope (non-goals)
- Bullet list of nearby things this change does NOT do, even if tempting.

## Structure
- Files added / modified / deleted.
- New types, functions, routes, or commands (signatures, not bodies).

## Verification
- [ ] Concrete check 1 (test, build, manual).
- [ ] Concrete check 2.

## Open questions
- Anything still unresolved. List or remove before approval.
```

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "The change is small enough to skip a spec." | If it touches 2+ files, the cost of the spec is < the cost of one revision. |
| "I'll write the spec after the code is working." | Specs written post-hoc rationalize the code rather than guide it. |
| "We can figure out edge cases in review." | Reviewers don't catch missing scope as well as the author does up-front. |

## Red flags

- The spec has no "Out of scope" section.
- "Verification" is vague ("works correctly", "is tested").
- Open questions remain at the time you start coding.

## Verification

- [ ] Spec approved by user (or self-approved with explicit "proceeding without review because trivial").
- [ ] Non-goals are listed.
- [ ] Verification criteria are checkable.
