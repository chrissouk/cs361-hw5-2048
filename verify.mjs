import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 1100 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const results = [];
mkdirSync('test-output', { recursive: true });
const snapshot = () => page.evaluate(() => JSON.parse(localStorage.getItem('gameState')));
async function seed(rows, score = 0) {
  await page.evaluate(({ rows, score }) => {
    const cells = rows[0].map((_, x) => rows.map((row, y) => {
      if (!row[x]) return null;
      return { position: { x, y }, value: row[x] };
    }));
    localStorage.setItem('gameState', JSON.stringify({
      grid: { size: 4, cells }, score, over: false, won: false, keepPlaying: false
    }));
  }, { rows, score });
  await page.reload();
  await page.waitForTimeout(180);
}
async function screenshot(name) {
  await page.locator('.container').screenshot({ path: 'test-output/' + name + '.png' });
}
try {
  await page.goto('http://127.0.0.1:8361');
  await seed([[2,2,4,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], 12);
  assert.equal(await page.locator('.undo-button').isDisabled(), true);
  const before = await snapshot();
  await screenshot('01-before-move');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(180);
  assert.equal((await snapshot()).score, 16);
  assert.equal(await page.locator('.undo-button').isEnabled(), true);
  await screenshot('02-after-move');
  await page.getByRole('button', { name: 'Undo move' }).click();
  await page.waitForTimeout(180);
  assert.deepEqual(await snapshot(), before);
  assert.equal(await page.locator('.undo-button').isDisabled(), true);
  assert.equal(await page.locator('.best-container').textContent(), '16');
  await screenshot('03-after-undo');
  results.push('Merge Undo restores exact board and score; best score is preserved; button is single use.');

  await seed([[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('.undo-button').isDisabled(), true);
  await page.evaluate(() => { Math.random = () => 0; });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);
  const afterRight = await snapshot();
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(120);
  assert.deepEqual(await snapshot(), afterRight);
  assert.equal(await page.locator('.undo-button').isEnabled(), true);
  await page.keyboard.press('u');
  await page.waitForTimeout(120);
  assert.equal((await snapshot()).grid.cells[0][0].value, 2);
  assert.equal(await page.locator('.undo-button').isDisabled(), true);
  results.push('No-op moves neither create nor consume history; U keyboard shortcut works.');

  await seed([[1024,1024,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  const beforeWin = await snapshot();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(120);
  assert.equal(await page.locator('.game-message').evaluate(el => el.classList.contains('game-won')), true);
  await page.getByRole('button', { name: 'Undo move' }).click();
  await page.waitForTimeout(120);
  assert.deepEqual(await snapshot(), beforeWin);
  assert.equal(await page.locator('.game-message').evaluate(el => el.classList.contains('game-won')), false);
  results.push('Undo after winning restores the pre-win state and clears the win overlay.');

  await seed([[2,4,8,16],[4,8,16,32],[8,16,32,64],[128,256,512,0]]);
  const beforeLoss = await snapshot();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);
  assert.equal(await page.locator('.game-message').evaluate(el => el.classList.contains('game-over')), true);
  await page.keyboard.press('u');
  await page.waitForTimeout(120);
  assert.deepEqual(await snapshot(), beforeLoss);
  assert.equal(await page.locator('.game-message').evaluate(el => el.classList.contains('game-over')), false);
  results.push('Undo after game over restores the pre-loss state and clears the loss overlay.');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);
  await page.keyboard.press('r');
  await page.waitForTimeout(120);
  assert.equal(await page.locator('.undo-button').isDisabled(), true);
  assert.equal((await snapshot()).score, 0);
  await seed([[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);
  assert.equal(await page.locator('.undo-button').isEnabled(), true);
  await page.reload();
  await page.waitForTimeout(120);
  assert.equal(await page.locator('.undo-button').isDisabled(), true);
  results.push('Restart and refresh clear Undo history.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(180);
  await screenshot('04-mobile');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  results.push('Mobile viewport fits without horizontal overflow.');
  assert.deepEqual(errors, []);
  results.push('No browser JavaScript errors.');
  writeFileSync('test-output/verification-results.json', JSON.stringify({ passed: true, results }, null, 2));
  console.log(results.join('\n'));
} finally {
  await browser.close();
}
