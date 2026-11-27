import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

test.beforeEach(async ({ page }) => {
  // Keep tests independent of production APIs and analytics.
  await page.route(/^https:\/\//, async (route) => {
    if (
      ['stylesheet', 'font', 'image'].includes(route.request().resourceType())
    ) {
      await route.continue();
      return;
    }
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/molecule-search/compounds')) {
      await route.fulfill({
        json: [{ chebi_id: 'CHEBI:16236', name: 'ethanol', smiles: 'CCO' }],
      });
    } else if (url.pathname.endsWith('/molecule-search/')) {
      await route.fulfill({
        json: {
          molecules: [
            { chebi_id: 'CHEBI:16236', score: 1 },
            { chebi_id: 'CHEBI:15361', score: 0.81 },
          ],
          truncated: false,
          next_cursor: null,
          items: [
            {
              analysis: 'MGYA00000001',
              assembly: 'ERZ1',
              molecules: [{ chebi_id: 'CHEBI:16236', score: 1 }],
            },
          ],
        },
      });
    } else await route.abort();
  });
});

test('searches selected ChEBI compounds and returns assembly molecule matches', async ({
  page,
}, testInfo) => {
  await page.goto('molecule-search');
  await page.getByLabel('Find a molecule by name or ChEBI ID').fill('ethanol');
  await page.getByText('ethanol (CHEBI:16236)', { exact: true }).click();
  await expect(page.getByLabel('SMILES', { exact: true })).toHaveValue('CCO');
  await page.getByRole('button', { name: 'Search similar molecules' }).click();
  await expect(page.locator('a[href*="chebi=CHEBI%3A16236"]')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'MGYA00000001' })
  ).toHaveAttribute('href', /analyses\/MGYA00000001\/functional\?type=rhea$/);
  const molecules = page.getByRole('table', {
    name: 'Molecules searched from IDSM',
  });
  await expect(
    molecules.getByRole('link', { name: 'CHEBI:15361', exact: true })
  ).toBeVisible();
  await expect(molecules).toContainText('0.810');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath('results.png'),
    fullPage: true,
  });
});

test('standalone Ketcher imports and exports a structure into the same search', async ({
  page,
}) => {
  await page.goto('molecule-search');
  await page.getByLabel('SMILES', { exact: true }).fill('CCO');
  await page.getByRole('button', { name: 'Draw a molecule' }).click();
  const dialog = page.getByRole('dialog', { name: 'Draw a molecule' });
  await expect(dialog).toBeVisible();
  const drawingSearch = page.getByRole('button', {
    name: 'Search this drawing',
  });
  await expect(drawingSearch).toBeEnabled({ timeout: 60000 });
  const request = page.waitForRequest(
    (request) =>
      request.method() === 'POST' && request.url().endsWith('/molecule-search/')
  );
  await drawingSearch.click();
  expect((await request).postDataJSON().smiles).toBeTruthy();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('a[href*="chebi=CHEBI%3A16236"]')).toBeVisible();
});

test('editor loading failure leaves SMILES search usable', async ({ page }) => {
  await page.route('**/src/pages/MoleculeSearch/KetcherInput.tsx*', (route) =>
    route.abort()
  );
  await page.goto('molecule-search');
  await page.getByRole('button', { name: 'Draw a molecule' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Cannot load the structure editor.'
  );
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('heading', { name: 'Search by molecule' })
  ).toBeVisible();
  await page.getByLabel('SMILES', { exact: true }).fill('CCO');
  await page.getByRole('button', { name: 'Search similar molecules' }).click();
  await expect(page.getByRole('link', { name: 'MGYA00000001' })).toBeVisible();
});

test('empty Ketcher can open, close, and reopen without crashing the page', async ({
  page,
}) => {
  await page.goto('molecule-search');
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.getByRole('button', { name: 'Draw a molecule' }).click();
    const searchDrawing = page.getByRole('button', {
      name: 'Search this drawing',
    });
    await expect(searchDrawing).toBeEnabled({ timeout: 60000 });
    await searchDrawing.click();
    await expect(page.getByRole('alert')).toContainText(
      'Draw a molecule before searching.'
    );
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('dialog', { name: 'Draw a molecule' })
    ).not.toBeVisible();
  }
  await expect(
    page.getByRole('heading', { name: 'Search by molecule' })
  ).toBeVisible();
});

test('reports upstream failures separately from empty results', async ({
  page,
}) => {
  await page.route('**/molecule-search/', (route) =>
    route.fulfill({
      status: 502,
      json: { detail: 'Chemical lookup is unavailable.' },
    })
  );
  await page.goto('molecule-search');
  await page.getByLabel('SMILES', { exact: true }).fill('CCO');
  await page.getByRole('button', { name: 'Search similar molecules' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Chemical lookup is unavailable.'
  );
  await expect(
    page.getByText('No indexed assembly analyses match this search.')
  ).not.toBeVisible();
});

test('Search menu retains text search and opens molecule search', async ({
  page,
}) => {
  await page.goto('');
  await page.locator('#text-search-section').click();
  await expect(
    page.getByRole('link', { name: 'Text search', exact: true })
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Search by molecule', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Search by molecule' })
  ).toBeVisible();
});

test('ChEBI attributes in a GFF retain exact feature matches and coordinates in IndexedDB', async ({
  page,
}) => {
  const gff = [
    '##gff-version 3',
    'ERZ1_1\ttest\tCDS\t100\t200\t.\t+\t.\tID=protein1;chebi_reaction=CHEBI:15361 + CHEBI:15377;',
    'ERZ1_1\ttest\tCDS\t300\t400\t.\t+\t.\tID=protein2;chebi_reaction=CHEBI:153610;',
  ].join('\n');
  await page.route('https://example.test/chebi.gff', (route) =>
    route.fulfill({ body: gff })
  );
  await page.goto('molecule-search');
  const matches = await page.evaluate(async () => {
    const indexPath = '/metagenomics/src/utils/locallyIndexedGff.ts';
    const matchesPath = '/metagenomics/src/utils/gffSearchMatches.ts';
    const index = await import(indexPath);
    const search = await import(matchesPath);
    await index.resetDb();
    await index
      .importGffToIndexedDB({
        url: 'https://example.test/chebi.gff',
        assemblyAccession: 'ERZ1',
        attrsToIndex: [],
      })
      .start();
    const contig = await index.db.contigs.toCollection().first();
    return (await search.getFeatureMatchPage(contig, 'CHEBI:15361', true))
      .matches;
  });
  expect(matches).toHaveLength(1);
  expect(matches[0]).toMatchObject({ start: 100, end: 200 });
  expect(matches[0].text).toContain('CHEBI:15361');
});

for (const indexed of [false, true]) {
  for (const header of [false, true]) {
    test(`molecule drill-down prefills exact Rhea search (${
      indexed ? 'indexed' : 'plain'
    }, ${header ? 'header' : 'headerless'})`, async ({ page }) => {
      const fixture = JSON.parse(
        fs.readFileSync(
          path.join(
            __dirname,
            '../cypress/fixtures/apiv2/analyses/analysisMGYA00000002.json'
          ),
          'utf8'
        )
      );
      const rows = [
        'ERZ1\tprotein_first\thash\tRHEA:1\tCHEBI:16236 + CHEBI:15377\treaction\tTrue',
        'ERZ1\tprotein_partial\thash\tRHEA:2\tCHEBI:162360\treaction\tTrue',
      ];
      if (header)
        rows.unshift(
          'contig_id\tprotein_id\tprotein_hash\trhea_id\tchebi_reaction\treaction\ttop_hit'
        );
      const text = rows.join('\n') + '\n';
      const fileUrl = 'https://example.test/rhea.tsv.gz';
      const gzip = gzipSync(text);
      let bytes = gzip;
      if (indexed) {
        // Add the BGZF extra field to this small, single-block gzip fixture.
        const header = Buffer.from(gzip.subarray(0, 10));
        header[3] = 4;
        const extra = Buffer.from([6, 0, 66, 67, 2, 0, 0, 0]);
        extra.writeUInt16LE(gzip.length + 7, 6);
        bytes = Buffer.concat([header, extra, gzip.subarray(10)]);
      }
      fixture.accession = 'MGYA00000001';
      fixture.downloads = [
        {
          alias: 'rhea.tsv.gz',
          download_group: 'functional_annotation.rhea_reactions',
          file_type: 'tsv',
          url: fileUrl,
          index_files: indexed
            ? [{ index_type: 'gzi', url: fileUrl + '.gzi' }]
            : null,
        },
      ];
      await page.route('**/analyses/MGYA00000001', (route) =>
        route.fulfill({ json: fixture })
      );
      await page.route(fileUrl + '.gzi', (route) =>
        route.fulfill({ body: Buffer.alloc(8) })
      );
      await page.route(fileUrl, (route) => {
        const range = /bytes=(\d+)-(\d+)/.exec(
          route.request().headers().range || ''
        );
        return route.fulfill({
          status: range ? 206 : 200,
          headers: { 'content-length': String(bytes.length) },
          body:
            route.request().method() === 'HEAD'
              ? Buffer.alloc(0)
              : range
              ? bytes.subarray(Number(range[1]), Number(range[2]) + 1)
              : bytes,
        });
      });
      await page.goto('molecule-search');
      await page.getByLabel('SMILES', { exact: true }).fill('CCO');
      await page
        .getByRole('button', { name: 'Search similar molecules' })
        .click();
      await page.locator('a[href*="chebi=CHEBI%3A16236"]').click();
      await expect(page).toHaveURL(/functional\?type=rhea&chebi=CHEBI%3A16236/);
      const dialog = page.getByRole('dialog', { name: 'Search TSV table' });
      await expect(dialog).toBeVisible();
      await expect(page.locator('#compressed-tsv-search-term')).toHaveValue(
        'CHEBI:16236'
      );
      await expect(
        dialog.getByRole('button', {
          name: 'Whole-word search. Click for wildcard (partial word) search.',
        })
      ).toBeVisible();
      await dialog.getByRole('button', { name: 'Search', exact: true }).click();
      await expect(
        page.locator('.compressed-tsv-table__search-status')
      ).toContainText('Showing 1 row matching CHEBI:16236');
      await expect(page.locator('.compressed-tsv-table tbody')).toContainText(
        'protein_first'
      );
      await expect(
        page.locator('.compressed-tsv-table tbody')
      ).not.toContainText('protein_partial');
    });
  }
}
