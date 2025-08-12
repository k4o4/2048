# 2048 Web App — Engine + Thin UI

This project implements a deterministic, testable 2048 engine and a minimal React UI with deterministic Playwright e2e.

## How to run locally

- Full local CI (install + unit/integration/acceptance + e2e):

  ```cmd
  scripts\ci.cmd
  ```

- Acceptance suite only (verbose):

  ```cmd
  scripts\acceptance-only.cmd
  :: single case
  scripts\acceptance-only.cmd -Id C08
  ```

- Build/preview production:

  ```cmd
  pnpm build
  pnpm preview
  ```

The preview server runs at http://localhost:4173 by default.

## Deterministic e2e

When `VITE_E2E=1`, the UI exposes small hooks used by Playwright:

- `window.__setBoard(board: number[][])`: set the whole board.
- `window.__queueSpawn(list: Array<{row:number; col:number; value:2|4}>)`: enqueue exact spawns in order.
- `window.__doTurn(direction: 'Left'|'Right'|'Up'|'Down')`: apply one move.
- There is a stable turn indicator: `<div data-testid="turn" data-turn="<n>"/>` so tests can wait for a turn to complete.

These hooks are only present when `VITE_E2E==='1'` and are compiled away in production builds. Playwright injects `VITE_E2E=1` via `webServer.env` in `playwright.config.ts`.

## Troubleshooting (Windows)

- If PowerShell policies block scripts, use the provided `scripts\\*.cmd` wrappers or run commands via:

  ```cmd
  "D:\\Program Files\\nodejs\\pnpm.cmd" <command>
  ```

- If the e2e server port is in use, stop any old server or change the port in `playwright.config.ts` and `vite.config.ts`.

## Coverage

Engine coverage thresholds are enforced via Vitest config: lines/statements/functions ≥ 95%, branches ≥ 90%. The HTML report is generated under `coverage/`.


