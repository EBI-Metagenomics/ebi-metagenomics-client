import { test, expect, acceptCookies } from './fixtures';

test.describe('Training Courses Component', () => {
  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
    await page.route('**/ebisearch/ws/rest/ebiweb_training_events*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ entries: [{ id: '1', fields: { name: ['Live Training 1'], description: ['Desc'] } }] }) });
    });
    await page.route('**/ebisearch/ws/rest/ebiweb_training_online*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ entries: [{ id: '1', fields: { name: ['On-demand Training 1'], description: ['Desc'] } }] }) });
    });
    await page.goto('');
    await page.evaluate(() => window.location.hash = '#training__section--1');
  });

  test('should display and switch between tabs', async ({ page }) => {
    await expect(page.locator('.vf-tabs__list')).toBeVisible();
    const tabs = page.locator('.vf-tabs__link');
    await expect(tabs).toHaveCount(2);
    await expect(tabs.first()).toContainText('On-demand training');
    await expect(tabs.last()).toContainText('Live training');

    await tabs.last().click();
    await expect(page.url()).toContain('#training__section--2');
    await tabs.first().click();
    await expect(page.url()).toContain('#training__section--1');
  });

  test('should display training content when loaded', async ({ page }) => {
    await page.locator('.vf-tabs__link').first().click();
    const section = page.locator('#training__section--1');
    await expect(section.locator('.vf-summary--event')).toHaveCount(1);
    await expect(section.locator('.vf-summary__title').first()).toBeVisible();
    await expect(section.locator('.vf-summary__text').first()).toBeVisible();
  });

  test('should handle empty states', async ({ page }) => {
    await page.route('**/ebisearch/ws/rest/ebiweb_training_events*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ entries: [] }) });
    });
    await page.reload();
    await page.locator('.vf-tabs__link').last().click();
    await expect(page.getByText('Currently there are no upcoming events')).toBeVisible();
  });

  test('should have working "View all" link', async ({ page }) => {
    const link = page.locator('#view-all-on-demand-training-link');
    await expect(link).toHaveAttribute('href', /.*\/training\/services\/mgnify\/on-demand/);
  });

  test('should maintain tab state on page refresh', async ({ page }) => {
    await page.locator('.vf-tabs__link').last().click();
    await expect(page.url()).toContain('#training__section--2');
    await page.reload();
    await expect(page.url()).toContain('#training__section--2');
    await expect(page.locator('#training__section--2')).toBeVisible();
  });
});
