import { test, expect, acceptCookies } from './fixtures';

test.describe('About page', () => {
  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
  });

  test('Contains all the about sections', async ({ page }) => {
    await page.goto('');
    await page.locator('.mg-main-menu').getByText('About').click();
    
    const content = page.locator('.about-page');
    await expect(content.getByText('The MGnify resource')).toBeVisible();
    await expect(content.getByText('Staying informed')).toBeVisible();
    await expect(content.getByText('Cite us')).toBeVisible();
    await expect(content.getByText('Latest publications')).toBeVisible();
    await expect(content.getByRole('heading', { name: 'Funding' })).toBeVisible();
  });

  test('Clicking button should display / hide publications', async ({ page }) => {
    await page.goto('');
    await page.locator('.mg-main-menu').getByText('About').click();
    
    const citationDiv = page.locator('.mg-pub-section');
    const button = citationDiv.locator('button');
    
    await expect(citationDiv.locator('article')).toHaveCount(3);
    await button.click();
    await expect(citationDiv.locator('article')).toHaveCount(9);
    await button.click();
    await expect(citationDiv.locator('article')).toHaveCount(3);
  });
});
