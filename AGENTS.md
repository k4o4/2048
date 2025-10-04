# AGENTS.md

## Start here (context)
Before any edits or commands, always read:
- memory-bank/activeContext.md
- memory-bank/tasks.md
- memory-bank/progress.md

Summarize the current goal and constraints in 5–8 bullets and ask for confirmation if unclear.

## Build & test
- Install: pnpm install
- Unit tests: pnpm test
- E2E (if any): pnpm vitest run
- Lint/types: pnpm lint

## Policies
- Work only inside the repo unless explicitly allowed.
- Never drop tests; add/update tests for changed code.
- If a feature flag is involved (e.g., VITE_FP_COLORS), propose a minimal, test-covered change first.

## Style
- TypeScript strict, functional bias, single quotes, no semicolons.

