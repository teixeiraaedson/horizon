import { test, expect } from '@playwright/test';

test('export evidence downloads transactions CSV', async ({ page }) => {
  await page.goto('/dashboard');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Evidence' }).click();
  await page.getByRole('menuitem', { name: 'Export Transactions CSV' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
});