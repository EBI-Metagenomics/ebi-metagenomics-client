import { test, expect, acceptCookies } from './fixtures';

const origPage = 'browse';

test.describe('Browse page', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await acceptCookies(page);
    await mockApi('**/super-studies/**', 'apiv2/super-studies/superStudiesList.json');
  });

  test.describe('Super studies table', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${origPage}/super-studies`);
      await expect(page.locator('h2')).toContainText('Browse MGnify');
    });

    test('Should contain correct number of super studies', async ({ page }) => {
      await expect(page.locator('.mg-table-caption')).toContainText('1');
      await expect(page.locator('.vf-table__body > .vf-table__row')).toHaveCount(1);
      await expect(page.locator('.vf-table__body > .vf-table__row > :nth-child(1)')).toContainText('Excellent');
    });

    test('Should have markdown rendered description', async ({ page }) => {
      await expect(page.locator('.vf-table__body > .vf-table__row > :nth-child(2)')).toContainText('excellent adventure');
      // Playwright's toHaveHTML is not exactly what we need, but we can check for bold text
      await expect(page.locator('.vf-table__body > .vf-table__row > :nth-child(2) strong')).toHaveText('excellent adventure');
    });

    test('Should have download button', async ({ page }) => {
      await expect(page.getByText('Download')).toBeVisible();
    });
  });

  test.describe('Studies table', () => {
    test.beforeEach(async ({ page, mockApi }) => {
      await mockApi('**/biomes/**', 'apiv2/biomes/biomeList.json');
      await mockApi('**/studies/**', 'apiv2/studies/studyListAll.json');
      
      // Specific biome filtering mock
      await page.route(url => url.toString().includes('/studies/') && url.toString().includes('biome_lineage=root:Engineered'), async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], meta: { pagination: { count: 0 } } }),
        });
      });

      await page.goto(`${origPage}/studies`);
      await expect(page.locator('h2')).toContainText('Browse MGnify');
    });

    test('Should contain correct number of studies', async ({ page }) => {
      await expect(page.locator('.mg-table-caption')).toContainText('1');
      await expect(page.locator('.vf-table__body > .vf-table__row')).toHaveCount(1);
      await expect(page.locator('.vf-table__body > .vf-table__row > :nth-child(2)')).toContainText('MGYS00000001');
    });

    test('Should respond to biome filtering', async ({ page }) => {
      await page.locator('#biome-select').click();
      await page.getByText('All Engineered', { exact: false }).first().click();
      await expect(page.locator('.vf-table__body > .vf-table__row')).toHaveCount(0);
      await expect(page.getByText('No matching data')).toBeVisible();
    });
  });

  test.describe('Samples table', () => {
    test.beforeEach(async ({ page, mockApi }) => {
      await mockApi('**/biomes/**', 'apiv2/biomes/biomeList.json');
      await mockApi('**/samples/**', 'apiv2/samples/sampleListAll.json');
      
      await page.route(url => url.toString().includes('/samples/') && url.toString().includes('biome_lineage=root:Engineered'), async (route) => {
        const fullPath = require('path').join(__dirname, '..', 'cypress', 'fixtures', 'apiv2/samples/sampleListEngineered.json');
        const data = require('fs').readFileSync(fullPath, 'utf8');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: data,
        });
      });

      await page.goto(`${origPage}/samples`);
      await expect(page.locator('h2')).toContainText('Browse MGnify');
    });

    test('Should contain correct number of samples', async ({ page }) => {
      await expect(page.locator('.mg-table-caption')).toContainText('3');
      await expect(page.locator('.vf-table__body > .vf-table__row')).toHaveCount(3);
      await expect(page.locator('.vf-table__body > .vf-table__row > :nth-child(2)').first()).toContainText('SAMN07793787');
    });

    test('Should respond to biome filtering', async ({ page }) => {
      await page.locator('#biome-select').click();
      await page.getByText('All Engineered', { exact: false }).first().click();
      await expect(page.locator('.vf-table__body > .vf-table__row')).toHaveCount(1);
    });
  });
});
