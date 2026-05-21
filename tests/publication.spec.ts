import { test, expect, acceptCookies } from './fixtures';

const publicationId = "1";
const origPage = `publications/${publicationId}`;
const pageTitle = 'Publication';

test.describe('Publication page', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await acceptCookies(page);
    await mockApi(`**/publications/1`, 'apiv2/publications/publication1.json');
    await mockApi(`**/publications/1/annotations`, 'apiv2/publications/publication1Annotations.json');
    
    // EuropePMC mock
    await page.route(`**/rest/article/MED/1**`, async (route) => {
        const fullPath = require('path').join(__dirname, '..', 'cypress', 'fixtures', 'europepmc/publicationArticle1.json');
        const data = require('fs').readFileSync(fullPath, 'utf8');
        await route.fulfill({ status: 200, contentType: 'application/json', body: data });
    });
  });

  test.describe('General info', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2').first()).toContainText('Publication: The Origin of Species');
    });

    test('Verify elements are present', async ({ page }) => {
      await expect(page.locator('h2').first()).toContainText('Publication: The Origin of Species');
      await expect(page.locator('h4').first()).toContainText('Charles Darwin');
      await expect(page.getByText('Cambridge University Press')).toBeVisible();
      await expect(page.getByText('1859')).toBeVisible();
    });

    test('Shows Europe PMC Abstract', async ({ page }) => {
      await expect(page.getByText('such an unerring power at work on natural selection')).toBeVisible();
    });
  });

  test.describe('Related Projects table', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2').first()).toContainText('Publication: The Origin of Species');
    });

    test('Should show related study', async ({ page }) => {
      await expect(page.getByText('Associated studies')).toBeVisible();
      await expect(page.getByText('Project 1')).toBeVisible();
    });
  });

  test.describe('Error handling', () => {
    test('Should display error message if invalid Publication Id passed in URL', async ({ page }) => {
      const pubmedId = '99';
      await page.route(`**/publications/${pubmedId}`, async (route) => {
          await route.fulfill({
              status: 404,
              contentType: 'application/json',
              body: JSON.stringify({errors: [{detail: 'Not found'}]})
          });
      });
      await page.goto(`publications/${pubmedId}`);
      await expect(page.getByText('Error Fetching Data')).toBeVisible();
    });
  });
});
