### Fix now


### Next

- Feature flags: add animation & colors behind feature flags (no behavior changes)
  - Feature flags: `VITE_FF_ANIMATIONS=1` and `VITE_FF_COLORS=1` (default off).
  - Gate CSS classes/variables and any transitions behind these flags (no logic changes to engine or move semantics).
  - Add a runtime toggle in the UI to flip flags for demos/dev only; compile-time flags control production.
  - Keep DOM structure stable to avoid test fragility; only conditional classes/styles.
  - Optional: small runtime toggle in UI for FF flags (dev-only).

- Minimal guardrails
  - Deterministic spawn in tests: policy codified and used in acceptance runner.
  - Merge-once invariants: verify existing unit tests fully cover double-merge prevention; add focused cases if any gaps remain.
  - Lose/win sequencing checks: win detected pre-spawn; lose detected after spawn on changed moves.
- Lint/test ergonomics
  - Speed-ups: enable ESLint cache and concurrency if needed; verify `pnpm run test:unit`, `:int`, `:acc`, `:prop` all work quickly in isolation.

### Done

- Created memory files under `memory-bank/` (`tasks.md`, `activeContext.md`, `progress.md`).
- Inventoried key files (`package.json`, `src/ui/App.tsx`, `engine/index.ts`, `src/spawn.ts`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`).
- Installed dependencies with pnpm and ran baseline tests; captured results above.
- Acceptance deterministic spawn harness implemented in tests and green (`tests/acceptance/runner.spec.ts` using `tests/utils/testSpawn.ts`, `initial_spawns: 0`).
- Unit suite refactored to use `tests/utils/testState.ts`; all unit tests green.
- Flags scaffold added in `src/flags.ts`; default OFF.
- FF_COLORS wired via `.ff-colors` class on `app-wrapper`; default OFF; tests green.
- FF_ANIMATIONS wired via `animRunner` with one-shot onDone; default OFF; tests green.
