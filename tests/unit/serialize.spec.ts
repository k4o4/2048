import { describe, expect, it } from 'vitest';
import { serialize, deserialize } from '../../engine';
import { makeTestState } from '../utils/testState';

describe('serialize/deserialize', () => {
  it('round-trip exact', () => {
    const s = makeTestState({ N: 4, spawn: { mode: 'none' }, board: [
      [2, 0, 2, 4],
      [0, 4, 0, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]});
    s.stop_on_win = false;
    s.score = 42;
    const json = serialize(s);
    const t = deserialize(json);
    // spawn_script functions are not preserved through JSON; compare structural fields
    expect({ ...t, spawn_script: {} as any }).toEqual({ ...s, spawn_script: {} as any });
  });
});


