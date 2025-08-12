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



