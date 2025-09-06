import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/flags', async () => ({ FF_ANIMATIONS: false }));

describe('animRunner begin (OFF mode)', () => {
  it('invokes onDone synchronously exactly once', async () => {
    const { begin } = await import('../../src/ui/animRunner');
    const onDone = vi.fn();
    begin([], () => '', onDone);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

