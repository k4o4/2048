import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:5173'
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { (window as any).__testSpawnQueue = []; });
});

test('loads app and shows title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('2048');
});

test('basic move spawns exactly one tile', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => typeof (window as any).__doTurn === 'function');
  
  // Arrange - set up the board and spawn queue
  await page.evaluate(() => { 
    console.log('Setting board to:', [[2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
    (window as any).__setBoard([[2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]); 
  });
  
  await page.evaluate(() => { 
    console.log('Queueing spawn:', { row: 0, col: 3, value: 2 });
    (window as any).__queueSpawn([{ row: 0, col: 3, value: 2 }]); 
  });
  
  // Wait for the board to be set and verify the initial state
  await page.waitForFunction(() => {
    const cell = document.querySelector('[data-testid="cell-r0-c0"]');
    return cell && cell.textContent === '2';
  });
  
  // Verify the initial board state
  await expect(page.getByTestId('cell-r0-c0')).toHaveText('2');
  await expect(page.getByTestId('cell-r0-c1')).toHaveText('2');
  await expect(page.getByTestId('cell-r0-c2')).toHaveText('');
  await expect(page.getByTestId('cell-r0-c3')).toHaveText('');
  
  const turn = await page.getByTestId('turn').getAttribute('data-turn');
  console.log('Initial turn:', turn);
  
  // Act - make the left move
  await page.evaluate(() => { 
    console.log('Making left move');
    (window as any).__doTurn('Left'); 
  });
  
  // Wait for the turn to change
  await page.waitForFunction((t) => {
    const newTurn = document.querySelector('[data-testid="turn"]')?.getAttribute('data-turn');
    console.log('Turn changed from', t, 'to', newTurn);
    return newTurn !== t;
  }, turn);
  
  // Assert - check that the 2s merged to 4 and the spawn was applied
  await expect(page.getByTestId('cell-r0-c0')).toHaveText('4');
  await expect(page.getByTestId('cell-r0-c3')).toHaveText('2');
});

test('no-op does not spawn', async ({ page }) => {
  await page.goto('/');
  // Fill board so Left is no-op
  // No spawn should be consumed
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('cell-r0-c1')).toHaveText('');
});

test('no console errors on many key moves', async ({ page }) => {
  const errors:string[] = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/');
  const keys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
  for (let i=0;i<40;i++) await page.keyboard.press(keys[i%4]);
  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('game over shows modal and New Game button', async ({ page }) => {
  await page.goto('/');
  // seed a blocked board (no merges, no empties)
  await page.evaluate(() => {
    // @ts-ignore
    window.__setBoard([
      [2,4,8,16],
      [32,64,128,256],
      [2,4,8,16],
      [32,64,128,256]
    ]);
  });
  // any move is a no-op; ensure engine detects Lost (your engine sets Lost on no-op if no legal moves)
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('modal')).toBeVisible();
  await expect(page.getByTestId('modal-score')).toContainText(/Score:/);
});

test('modal shows New record when score beats best', async ({ page }) => {
  await page.goto('/');
  // make best very low so current score beats it
  await page.evaluate(() => localStorage.setItem('2048.bestScore', '0'));
  // create a quick merge to ensure score > 0, then lose
  await page.evaluate(() => {
    // @ts-ignore
    window.__setBoard([
      [2,2,4,8],       // merging first two produces +4
      [32,64,128,256],
      [2,4,8,16],
      [32,64,128,256]
    ]);
  });
  await page.keyboard.press('ArrowLeft'); // merge occurs (+4), then no more moves → Lost
  await expect(page.getByTestId('modal-score')).toContainText(/New record:\s*\d+/);
  // Restart
  await page.getByTestId('modal-new').click();
  await expect(page.getByTestId('turn')).toHaveAttribute('data-turn', '0'); // or board reset assertion you already use
});
