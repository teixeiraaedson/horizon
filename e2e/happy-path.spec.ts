import { test, expect } from '@playwright/test';

test('mint then approval-required transfer', async ({ page }) => {
  // Mint: navigate and submit a small amount
  await page.goto('/mint');
  await page.getByLabel('Amount (USD)').fill('1000');
  await page.getByRole('button', { name: 'Mint USDP' }).click();
  // Expect a success toast message to appear (best-effort check)
  await expect(page.getByText(/Mint(ed| request created)/)).toBeVisible();

  // Lower approval threshold via settings
  await page.goto('/settings');
  await page.getByLabel('Approval Threshold (USD)').fill('100');
  // Transfer with amount above threshold
  await page.goto('/transfer');
  await page.getByLabel('Amount (USD)').fill('600');
  await page.getByRole('button', { name: 'Transfer Funds' }).click();
  await expect(page.getByText(/Release required/)).toBeVisible();
});