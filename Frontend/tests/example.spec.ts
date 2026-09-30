import { test, expect } from '@playwright/test';

test('has title and splash screen', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Vite \+ React/);

  // Expect the splash screen text to be visible on first load
  await expect(page.getByText('Veterinary & Pet Care Platform')).toBeVisible();
});

