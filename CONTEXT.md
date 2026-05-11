# CONTEXT — flowagent ubiquitous language

> Project glossary. Add terms as the domain emerges. Keep entries terse.

## Purpose

A shared vocabulary between human and agent. When `grill-with-docs` style work surfaces a new term, define
it here. Variables, functions, file names, and PR titles should reuse these terms verbatim.

## Format

```
- **Term** — one-sentence definition. Synonyms (if any). Anti-synonyms (what it is NOT).
```

## Domain terms

- **Workflow** — YAML로 정의된 선형 step 배열. 한 사용자가 로컬에서 정의·실행하는 단일 자동화 시퀀스. Not a DAG, not a pipeline (분기·병렬 없음).
- **Step** — Workflow를 구성하는 단일 실행 단위. `type: llm | shell` 중 하나. Not a "task" (task는 외부 시스템 용어로 충돌 우려).
- **Run** — Workflow 한 번의 실행 인스턴스. `runs/<timestamp>.jsonl`에 step별 입출력이 기록된다. Not "execution" (구어로만 사용).
- **Runner** — Workflow 정의를 받아 Step을 순서대로 실행하는 엔진 (`src/runner.ts`). Not "orchestrator" (분기·병렬 함의가 있어 회피).
- **Agent** — Step 안에서 LLM이 수행하는 단일 호출. 다중 단계 ReAct 루프가 아니라 입력→출력 한 번. MVP 범위 한정 정의.

## Project-level identifiers

- **flowagent** — this project. A standalone codebase at `/root/projects/flowagent`. Not the same as the
  adjacent `freetier-sentinel` project, despite the session-start hook surfacing that project's status.

## Anti-terms (avoid these)

- _(empty — populate as misnomers appear and are corrected)_
