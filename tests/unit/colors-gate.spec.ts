import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

async function renderAppHtml() {
  const { App } = await import('../../src/ui/App');
  return renderToString(React.createElement(App));
}

describe('FF_COLORS gate on app wrapper', () => {
  it('absent when FF_COLORS=false', async () => {
    vi.resetModules();
    vi.doMock('../../src/flags', async () => ({ FF_COLORS: false }));
    const html = await renderAppHtml();
    expect(html.includes('class="app-wrapper ff-colors"')).toBe(false);
    expect(html.includes('class="app-wrapper"')).toBe(true);
  });

  it('present when FF_COLORS=true', async () => {
    vi.resetModules();
    vi.doMock('../../src/flags', async () => ({ FF_COLORS: true }));
    const html = await renderAppHtml();
    expect(html.includes('class="app-wrapper ff-colors"')).toBe(true);
  });
});
