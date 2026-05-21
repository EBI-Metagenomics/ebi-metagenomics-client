import { test, expect, acceptCookies } from './fixtures';

test.describe('Home page', () => {
  test.beforeEach(async ({ page, mockApiWithData }) => {
    await acceptCookies(page);
    
    // Setup default search page routing mocks (from cypress/util/util.js)
    const typeCounts = {
      "amplicon": 356039,
      "assembly": 28873,
      "metabarcoding": 2039,
      "metagenomic": 33827,
      "metatranscriptomic": 2205,
      "long_reads_assembly": 2
    };
    for (const [experimentType, count] of Object.entries(typeCounts)) {
        await page.route(`**/ebisearch/ws/rest/metagenomics_analyses?**facets=experiment_type:${experimentType}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ "hitCount": count, "entries": [], "facets": [] })
            });
        });
    }
    
    await page.goto('');
  });

  test.describe('Page structure', () => {
    test('Should show the hero search title', async ({ page }) => {
      await expect(page.locator('.home-hero h1')).toContainText('Search study and sample descriptions');
    });

    test('Should show the search input with correct placeholder', async ({ page }) => {
      const input = page.locator('.search-text-input');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('placeholder', 'Enter keywords, sample names, or biome types...');
    });

    test('Should show the search submit button', async ({ page }) => {
      const button = page.locator('.home-search-box button[type="submit"]');
      await expect(button).toBeVisible();
      await expect(button).toContainText('Search');
    });

    test('Should show example searches section', async ({ page }) => {
      const examples = page.locator('.home-search-examples');
      await expect(examples).toBeVisible();
      await expect(examples).toContainText('Tara oceans');
      await expect(examples).toContainText('MGYS00000410');
      await expect(examples).toContainText('Human Gut');
    });

    test('Should show the three search method cards', async ({ page }) => {
      await expect(page.locator('.home-search-cards').first()).toBeVisible();
      await expect(page.getByText('Search by Text')).toBeVisible();
      await expect(page.getByText('Search by Protein')).toBeVisible();
      await expect(page.getByText('Search by Nucleotide')).toBeVisible();
    });

    test('Should show the Latest Publications section', async ({ page }) => {
      await expect(page.getByText('Latest Publications')).toBeVisible();
    });
  });

  test.describe('Search form', () => {
    test('Should navigate to search page with encoded query on form submit', async ({ page }) => {
      const query = 'tara oceans';
      await page.locator('.search-text-input').fill(query);
      await page.locator('.home-search-box button[type="submit"]').click();
      await expect(page.url()).toMatch(/query=tara(%20|\+)oceans/);
    });

    test('Should navigate to search page on pressing Enter in the input', async ({ page }) => {
      await page.locator('.search-text-input').fill('marine bacteria');
      await page.keyboard.press('Enter');
      await expect(page.url()).toMatch(/query=marine(%20|\+)bacteria/);
    });

    test('Should reflect typed text in the input field', async ({ page }) => {
      await page.locator('.search-text-input').fill('soil microbiome');
      await expect(page.locator('.search-text-input')).toHaveValue('soil microbiome');
    });

    test('Should navigate to search page even with empty query', async ({ page }) => {
      await page.locator('.home-search-box button[type="submit"]').click();
      await expect(page.url()).toContain('/search');
    });
  });

  test.describe('Example search links', () => {
    test('"Tara oceans" example link should navigate with correct query', async ({ page }) => {
      await page.locator('.home-search-examples a').getByText('Tara oceans').click();
      await expect(page.url()).toContain('query=tara+oceans');
    });

    test('"MGYS00000410" example link should navigate with correct query', async ({ page }) => {
      await page.locator('.home-search-examples a').getByText('MGYS00000410').click();
      await expect(page.url()).toContain('query=MGYS00000410');
    });

    test('"Human Gut" example link should navigate with correct query', async ({ page }) => {
      await page.locator('.home-search-examples a').getByText('Human Gut').click();
      await expect(page.url()).toContain('query=human+gut');
    });
  });

  test.describe('Search method cards navigation', () => {
    test('"Search by Text" card should link to /search', async ({ page }) => {
      const link = page.locator('a.vf-card__link').getByText('Search by Text');
      await expect(link).toHaveAttribute('href', /.*\/search/);
    });

    test('"Search by Protein" card should link to /proteins', async ({ page }) => {
      const link = page.locator('a.vf-card__link').getByText('Search by Protein');
      await expect(link).toHaveAttribute('href', /.*\/proteins/);
    });

    test('"Search by Nucleotide" card should link to /search-tools', async ({ page }) => {
      const link = page.locator('a.vf-card__link').getByText('Search by Nucleotide');
      await expect(link).toHaveAttribute('href', /.*\/search-tools/);
    });

    test('"Submit and/or Request" card should link to the right submissions page', async ({ page }) => {
      const link = page.locator('a.vf-card__link').getByText('Submit and/or Request');
      await expect(link).toHaveAttribute('href', /.*login\?from=private-request/);
    });

    test('"Request Public Dataset" card should link to the right submissions page', async ({ page }) => {
      const link = page.locator('a.vf-card__link').getByText('Request Public Dataset');
      await expect(link).toHaveAttribute('href', /.*login\?from=public-request/);
    });
  });
});
