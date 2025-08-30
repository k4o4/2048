## Bring baseline to green (deterministic spawn)

A) Current behaviour & failure pattern
- Acceptance tests (C03, C04, C05, C06, C07, C08, C12, C14, C15, C16, C19, C22, C23, C24) fail because the final board is missing the expected post-move spawn tile.
- Example C03 shows after a Right move that the engine board does not include the spawn `{row:1,col:0,value:4}` expected by the fixture.
- Score deltas and pre-spawn boards match expectations; only the spawn placement is missing in final results.

B) Hypotheses (ranked)
1) The acceptance runner is not providing a `spawn_script` to the engine, so `move()` cannot spawn post-move.
2) The runner provides a script but does not consume fixture-provided spawn entries; script returns null due to exhaustion or mismatch.
3) A board mutation/reset between init and move inadvertently drops the script reference.

C) Diagnostics
- Confirm runner constructs state with a spawn script derived from fixtures:
  - `tests/acceptance/runner.spec.ts`:
```26:37:tests/acceptance/runner.spec.ts
// Adapter to convert array format to SpawnScript interface
function createSpawnScriptAdapter(spawnArray: { row: number; col: number; value: 2 | 4 }[]): SpawnScript {
  let index = 0;
  return {
    nextSpawn: (board: readonly number[][]) => {
      if (index >= spawnArray.length) return null;
      const entry = spawnArray[index];
      index++;
      return entry;
    }
  };
}
```
```46:51:tests/acceptance/runner.spec.ts
const spawnScript = createSpawnScriptAdapter(fx.spawnScript);
const state = init({ N, initial_spawns: 0, ...fx.configOverrides, spawn_script: spawnScript });
// Seed board directly for now
state.board = fx.givenBoard.map((row) => [...row]);
```
- Engine call path for spawn:
```240:268:engine/index.ts
// Spawn exactly one tile using script if provided
if (next.spawn_script) {
  const spawnEntry = next.spawn_script.nextSpawn(next.board);
  if (spawnEntry) {
    // validation...
    next.board = cloneBoard(next.board);
    next.board[spawnEntry.row][spawnEntry.col] = spawnEntry.value;
  }
}
```
- Fixtures include explicit spawn steps (e.g., C03/C04/C12/C19):
```29:36:tests/acceptance/fixtures/C03.json
"spawnScript": [{ "row": 1, "col": 0, "value": 4 }]
```

D) Minimal FIX options (no engine changes)
- Critical runner fix: prevent fixture spawns from being consumed during init
  - Set `initial_spawns: 0` when constructing the acceptance test state so the fixture-provided spawns are available for the post-move call.
  - 3–5 line diff:
    - File: `tests/acceptance/runner.spec.ts`
      - Change init call to:
        const state = init({ N, initial_spawns: 0, ...fx.configOverrides, spawn_script: spawnScript });
- Option 1: Test-only deterministic SpawnScript util; inject via runner
  - Create `tests/utils/testSpawn.ts` exporting `createArraySpawnScript(spawns)` and `firstEmptySpawn()` fallback (row-major).
  - Update runner to use `createArraySpawnScript(fx.spawnScript)`; when `fx.spawnScript` is empty, fallback to `firstEmptySpawn()`.
  - 3–7 line diffs:
    - File: `tests/acceptance/runner.spec.ts`
      - Add import:
        import { createArraySpawnScript } from '../utils/testSpawn';
      - Replace adapter function usage:
        const spawnScript = createArraySpawnScript(fx.spawnScript);
- Option 2: Seeded RNG wrapper for tests
  - Add `tests/utils/seededRng.ts` simple LCG; build `createSeededSpawn(seed)` with first-empty placement and value 2|4 by RNG.
  - Runner reads `process.env.TEST_SEED ?? '0'` and constructs the script when `fx.spawnScript` is empty.
  - 3–7 line diffs:
    - File: `tests/acceptance/runner.spec.ts`
      - Add import:
        import { createSeededSpawn } from '../utils/seededRng';
      - Construct script:
        const spawnScript = fx.spawnScript?.length ? createArraySpawnScript(fx.spawnScript) : createSeededSpawn(process.env.TEST_SEED || '0');
- Option 3: Read spawns directly from fixture (current behavior) and ensure exhaustion-safe fallback
  - Keep current adapter but add a fallback to first-empty when the array is exhausted.
  - 3–7 line diffs:
    - File: `tests/acceptance/runner.spec.ts`
      - Modify `createSpawnScriptAdapter` nextSpawn body to:
        if (index < spawnArray.length) return spawnArray[index++];
        // fallback: first empty
        for (let r = 0; r < board.length; r++) for (let c = 0; c < board[r].length; c++) if (board[r][c] === 0) return { row: r, col: c, value: 2 };
        return null;

Recommendation: Option 1 is smallest and explicit; keeps fixtures in control and provides deterministic fallback for cases with empty spawn lists.

E) Test plan
- Unit
  - Add a spy SpawnScript in unit tests to assert:
    - move() invokes nextSpawn exactly once when changed === true
    - move() does not invoke nextSpawn when changed === false
- Acceptance
  - Re-run failures: C03, C04, C12 with deterministic script (fixtures already provide entries) → expect boards to match.
  - Spot-check a 5×5 case (C19) to ensure N is respected.
- Property (optional)
  - Under fixed seed, running a sequence of moves yields deterministic boards.

F) Done criteria & rollback
- Done when: acceptance suite passes; unit spawn-once tests pass; no engine semantics changed; coverage unchanged or improved.
- Rollback: revert runner/test utils changes if any regression appears in other suites; engine code remains untouched.
