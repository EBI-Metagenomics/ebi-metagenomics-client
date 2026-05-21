import { test, expect, acceptCookies } from './fixtures';

test.describe('V2 Assembly page', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await acceptCookies(page);
    await mockApi('**/assemblies/ERZ1', 'apiv2/assemblies/assemblyDetailERZ1.json');
  });

  test('shows basic assembly details', async ({ page, mockApiWithData }) => {
    const acc = 'ERZ1';
    await mockApiWithData(`**/assemblies/${acc}/genome-links`, { items: [] });

    await page.goto(`assemblies/${acc}/#analyses`);

    await expect(page.locator('h2')).toContainText(`Assembly: ${acc}`);
    await expect(page.getByText(`ENA accession`)).toBeVisible();
    await expect(page.getByText(`Study (of assembly)`)).toBeVisible();
    await expect(page.getByText(`MGYS1`)).toBeVisible();
  });

  test('renders Genomes with ENA, Sample, Runs and empty Derived genomes', async ({ page, mockApiWithData }) => {
    const acc = 'ERZ1';
    await mockApiWithData(`**/assemblies/${acc}/genome-links`, { items: [] });

    await page.goto(`assemblies/${acc}/#genomes`);

    await expect(page.locator('h2')).toContainText(`Assembly: ${acc}`);
    await expect(page.getByRole('heading', { name: 'Derived genomes' })).toBeVisible();
    await expect(page.getByText('No derived genomes found.')).toBeVisible();
  });

  test('renders Analyses tab and loads analyses via assemblies endpoint', async ({ page, mockApiWithData }) => {
    const acc = 'ERZ1';
    await mockApiWithData(`**/assemblies/${acc}/genome-links`, { items: [] });
    await mockApiWithData(`**/assemblies/${acc}/analyses*`, {
      count: 1,
      data: [
        {
          accession: 'MGYA00000001',
          sample: { accession: 'ERS000001' },
          assembly: { accession: acc },
          run: null,
          pipeline_version: 'v5.0'
        }
      ]
    });

    await page.goto(`assemblies/${acc}/#analyses`);

    await expect(page.getByText('Associated analyses')).toBeVisible();
    await expect(page.getByText('Analyses').first()).toBeVisible();

    await expect(page.getByText('Analysis accession')).toBeVisible();
    await expect(page.getByText('Sample accession')).toBeVisible();
    await expect(page.getByText('Pipeline version')).toBeVisible();

    await expect(page.getByText('MGYA00000001')).toBeVisible();
    await expect(page.getByText('ERS000001')).toBeVisible();
    await expect(page.getByText('5.0')).toBeVisible();
  });

  test('renders Derived genomes in Genomes', async ({ page, mockApiWithData }) => {
    const acc = 'ERZ1';
    const genomeAcc = 'MGYG000000001';

    await mockApiWithData(`**/assemblies/${acc}/genome-links`, {
      items: [
        {
          genome: {
            accession: genomeAcc,
            taxon_lineage: 'd__Bacteria',
            catalogue_id: 'human-gut',
            catalogue_version: '1.0'
          },
          species_rep: genomeAcc,
          mag_accession: 'ERZ000001',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ]
    });

    await page.goto(`assemblies/${acc}/#genomes`);

    await expect(page.getByRole('heading', { name: 'Derived genomes' })).toBeVisible();
    await expect(page.getByText(genomeAcc).first()).toBeVisible();
    await expect(page.getByText('ERZ000001')).toBeVisible();
    await expect(page.getByText('human-gut v1.0')).toBeVisible();
    await expect(page.getByText('Bacteria')).toBeVisible();
  });
});
