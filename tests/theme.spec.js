import { expect, test } from '@playwright/test';

test('restores the saved light theme on direct public access and reload', async ({ page }) => {
  await page.goto('/entrar');
  await expect(page.locator('body')).not.toHaveClass(/light-mode/);

  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/light-mode/);

  await page.goto('/criar-conta');
  await expect(page.locator('body')).toHaveClass(/light-mode/);
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/light-mode/);

  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/light-mode/);
});
