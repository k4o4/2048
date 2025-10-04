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

describe('Runtime colors gate', () => {
  it('defaults ON and toggles via checkbox', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    await renderAppInto(container);

    // default ON -> html has data-ff-colors="1" and wrapper has .ff-colors
    expect(document.documentElement.getAttribute('data-ff-colors')).toBe('1');
    const wrapper1 = container.querySelector('.app-wrapper') as HTMLElement;
    expect(wrapper1).toBeTruthy();
    expect(wrapper1.classList.contains('ff-colors')).toBe(true);

    const toggle = container.querySelector('[data-testid="toggle-colors"]') as HTMLInputElement;
    expect(toggle).toBeTruthy();
    expect(toggle.checked).toBe(true);

    // turn OFF
    await act(async () => {
      toggle.click();
      await Promise.resolve();
    });
    expect(document.documentElement.hasAttribute('data-ff-colors')).toBe(false);
    const wrapper2 = container.querySelector('.app-wrapper') as HTMLElement;
    expect(wrapper2.classList.contains('ff-colors')).toBe(false);

    // turn ON again
    await act(async () => {
      toggle.click();
      await Promise.resolve();
    });
    expect(document.documentElement.getAttribute('data-ff-colors')).toBe('1');
    const wrapper3 = container.querySelector('.app-wrapper') as HTMLElement;
    expect(wrapper3.classList.contains('ff-colors')).toBe(true);
  });
});
