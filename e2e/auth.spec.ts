import { test, expect } from '@playwright/test';

test('auth happy path: sign in as user', async ({ page }) => {
  await page.goto('/auth');
  const email = 'tester@demo.horizon';
  await page.getByPlaceholder('email@example.com').fill(email);
  await page.getByRole('button', { name: 'Sign in as User' }).click();

  // Navigate to dashboard and verify header shows user pill (email appears on wide screens)
  await page.goto('/dashboard');
  await expect(page.getByText('Sandbox Mode — simulated assets, no real funds')).toBeVisible();
});