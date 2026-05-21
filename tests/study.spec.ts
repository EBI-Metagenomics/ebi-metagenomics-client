import { test, expect, acceptCookies } from './fixtures';

const projectId = 'MGYS00000001';
const origPage = `studies/${projectId}/overview`;
const pageTitle = 'Study MGYS00000001';

test.describe('Study page', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await acceptCookies(page);
    await mockApi(`**/studies/${projectId}`, 'apiv2/studies/studyMGYS00000001.json');
    await mockApi(`**/studies/${projectId}/analyses/?page=1&page_size=10`, 'apiv2/studies/studyMGYS00000001AnalysesPage1.json');
    await mockApi(`**/studies/${projectId}/analyses/?page=2&page_size=10`, 'apiv2/studies/studyMGYS00000001AnalysesPage2.json');
    await mockApi(`**/studies/${projectId}/publications**`, 'apiv2/studies/studyMGYS00000001Publications.json');
    await mockApi(`**/publications/1/annotations`, 'apiv2/publications/publication1Annotations.json');
  });

  test.describe('General', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2')).toContainText(pageTitle);
      await expect(page.getByText('Project 1')).toBeVisible();
    });

    test('Verify elements are present', async ({ page }) => {
      await expect(page.locator('.vf-content h3')).toContainText('Project 1');
      await expect(page.locator('.vf-content h2')).toContainText('Study MGYS00000001');
      await expect(page.locator('[data-cy=study-external-links]')).toContainText('ENA website (PRJNA398089)');
      await expect(page.getByText('Host-associated:Plants')).toBeVisible();
      await expect(page.getByText('Microbiome sampling of a tomato skin.')).toBeVisible();
      
      const publicationsSection = page.getByText('Publications');
      await publicationsSection.scrollIntoViewIfNeeded();
      await expect(page.getByText('Cambridge University Press')).toBeVisible();
    });

    test('External links should all be valid', async ({ page }) => {
      const links = page.locator('[data-cy=study-external-links] > li > a');
      const count = await links.count();
      for (let i = 0; i < count; i++) {
        await expect(links.nth(i)).toHaveAttribute('href', 'https://www.ebi.ac.uk/ena/browser/view/PRJNA398089');
      }
    });
  });

  test.describe('Analysis table', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2')).toContainText(pageTitle);
      await expect(page.getByText('Project 1')).toBeVisible();
    });

    test('Should contain correct number of analyses', async ({ page }) => {
      await expect(page.locator('span.mg-number').first()).toContainText('11');
    });

    test('Analysis table download should handle empty analyses list', async ({ page, mockApiWithData }) => {
      await mockApiWithData(`**/studies/${projectId}/analyses/?page=1&page_size=10`, {
        links: { first: null, last: null, prev: null, next: null },
        data: [],
        meta: { pagination: { page: 1, pages: 1, count: 0 } }
      });
      
      await page.goto(origPage);
      await page.locator('[data-cy="emg-table-download-button"]').click();
      await expect(page.getByText('No data to download')).toBeVisible();
    });

    test('Analysis table download should show error if API response is bad', async ({ page }) => {
      await page.route(`**/studies/${projectId}/analyses/?page=1&page_size=10`, async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'text/plain',
          body: 'Internal Server Error',
        });
      });

      await page.goto(origPage);
      // Wait for table to show error or at least try to load
      await page.locator('[data-cy="emg-table-download-button"]').click();
      await expect(page.getByText('The data cannot be fetched just now')).toBeVisible();
    });
  });

  test.describe('Error handling', () => {
    test('Should display error message if invalid accession passed in URL', async ({ page }) => {
      const studyId = 'ERP019566012345';
      await page.route(`**/studies/${studyId}`, async (route) => {
          await route.fulfill({
              status: 404,
              body: JSON.stringify({errors: [{detail: 'Not found'}]})
          });
      });
      await page.goto(`studies/${studyId}/overview`);
      await expect(page.getByText('Error Fetching Data')).toBeVisible();
    });
  });

  test.describe('Downloads tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(origPage);
      await expect(page.locator('h2')).toContainText(pageTitle);
      await page.locator('.vf-tabs').getByText('Analysis').click();
    });

    test('Download links for V6 should be present', async ({ page }) => {
      const link = page.getByText('PRJNA398089_SILVA-SSU_study_summary.tsv');
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', /.*/);
    });
  });
});
