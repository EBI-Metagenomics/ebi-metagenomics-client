import { test, expect, acceptCookies } from './fixtures';

const superStudyId = 'excellent';
const origPage = `super-studies/${superStudyId}`;
const pageTitle = 'Super Study';

test.describe('Super Study page', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await acceptCookies(page);
    await mockApi(`**/super-studies/${superStudyId}`, 'apiv2/super-studies/superStudyExcellent.json');
    await page.route(`**/fieldfiles/**logo.png`, async (route) => {
        await route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('') });
    });
  });

  test.describe('Landing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2').first()).toContainText(pageTitle);
    });

    test('Verify elements are present', async ({ page }) => {
      await expect(page.locator('h2').first()).toContainText('Super Study');
      await expect(page.locator('h3')).toContainText('Excellent Adventure');
      await expect(page.locator('[data-cy=\'superStudyDescription\']')).toContainText('space and time');
      await expect(page.locator('[data-cy=\'superStudyLogo\']')).toBeVisible();
    });
  });

  test.describe('Flagship Projects table', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2').first()).toContainText(pageTitle);
    });

    test('Should have correct data', async ({ page }) => {
      const tab = page.getByText('Flagship Projects');
      await expect(tab).toBeVisible();
      await tab.click();
      const table = page.locator('[data-cy="superStudyFlagshipTable"]');
      await expect(table).toContainText('MGYS00000001');
      await expect(table.locator('.vf-table__body > .vf-table__row')).toHaveCount(1);
    });
  });

  test.describe('Related Projects table', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2').first()).toContainText(pageTitle);
    });

    test('Should be present with empty table', async ({ page }) => {
      const tab = page.getByText('Related Projects');
      await expect(tab).toBeVisible();
      await tab.click();
      const table = page.locator('[data-cy="superStudyRelatedTable"]');
      await expect(table).toContainText('No matching data');
    });
  });

  test.describe('MAG Catalogues table', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2').first()).toContainText(pageTitle);
    });

    test('Should have correct data', async ({ page }) => {
      const tab = page.getByText('Related Genome Catalogues');
      await expect(tab).toBeVisible();
      await tab.click();
      const table = page.locator('[data-cy="superStudyCataloguesTable"]');
      await expect(table).toContainText('human-gut-v2-0');
      await expect(table.locator('.vf-table__body > .vf-table__row')).toHaveCount(1);
    });
  });

  test.describe('Error handling', () => {
    test('Should display error message if invalid super study Id passed in URL', async ({ page }) => {
      const invalidId = '99';
      await page.route(`**/super-studies/${invalidId}`, async (route) => {
          await route.fulfill({
              status: 404,
              contentType: 'application/json',
              body: JSON.stringify({errors: [{detail: 'Not found'}]})
          });
      });
      await page.goto(`super-studies/${invalidId}`);
      await expect(page.getByText('Error Fetching Data')).toBeVisible();
    });
  });
});
