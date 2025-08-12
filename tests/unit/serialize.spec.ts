import { describe, expect, it } from 'vitest';
import { init, serialize, deserialize } from '../../engine';

describe('serialize/deserialize', () => {
  it('round-trip exact', () => {
    const s = init({ N: 4, stop_on_win: false });
    s.board = [
      [2, 0, 2, 4],
      [0, 4, 0, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    s.score = 42;
    const json = serialize(s);
    const t = deserialize(json);
    expect(t).toEqual(s);
  });
});


