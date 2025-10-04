import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

function renderAppInto(container: HTMLElement) {
  const root = createRoot(container);
  return import('../../src/ui/App').then(({ App }) => {
    act(() => {
      root.render(React.createElement(App));
    });
    return { root };
  });
}

describe('Color styling', () => {
  it('always renders colorful tiles', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    await renderAppInto(container);

    const wrapper = container.querySelector('.app-wrapper') as HTMLElement;
    expect(wrapper).toBeTruthy();
    const tile = container.querySelector('.tile') as HTMLElement;
    expect(tile).toBeTruthy();
    expect(getComputedStyle(tile).backgroundColor).not.toBe('');
  });
});
