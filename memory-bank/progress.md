2025-08-30 13:15
- Created `memory-bank/` with `tasks.md`, `activeContext.md`, `progress.md`.
- Inventoried key files and configs.
- Ran `pnpm install` (success).
- Ran `pnpm run test`: 11/19 test files failed; 34/61 tests failed. Failures centered on acceptance fixtures where post-move spawns are missing (likely `spawn_script` not supplied in state). Pending follow-up to align spawn behavior with test expectations.
2025-08-30 13:25
- PLAN for deterministic spawn produced.
2025-08-30 13:40
- Acceptance: GREEN (25/25). Wired deterministic spawn via test runner (`initial_spawns: 0`, fixtures consumed, safe fallback only when non-empty/exhausted). Test-only changes; engine/UI untouched.
2025-08-30 14:13
- Baseline green: unit 31/31, acc 25/25. Tests-only changes: testSpawn util + runner wiring. Ready to start feature flags for animations/colors (no behavior change by default).
2025-08-30 19:45
- Flags scaffold added (FF_ANIMATIONS/FF_COLORS default off); suites green (unit 32/32, acc 25/25).
