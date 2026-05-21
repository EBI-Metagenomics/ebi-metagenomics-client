import { test, expect, acceptCookies } from './fixtures';

const config = {
  api_v2: '**/api/v1', // This might need to be adjusted based on actual config
};

function stubAnalysisDetails(accession, experimentType, overrides = {}) {
  return {
    accession: accession,
    study_accession: 'MGYS0000001',
    experiment_type: experimentType,
    pipeline_version: 'V6',
    run: { accession: 'ERR000001' },
    sample: { accession: 'ERS000001' },
    read_run: {
      instrument_model: 'Illumina HiSeq 2000',
      instrument_platform: 'ILLUMINA',
    },
    assembly: null,
    downloads: [
      {
        "alias": "multiqc_report.html",
        "download_type": "Quality control",
        "file_type": "html",
        "long_description": "MultiQC webpage showing quality control steps and metrics",
        "short_description": "MultiQC quality control report",
        "download_group": "quality_control",
        "file_size_bytes": null,
        "index_files": null,
        "url": "http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/ERZ857/ERZ857107/V6/assembly/qc/multiqc_report.html"
      },
    ],
    quality_control_summary: {},
    metadata: {},
    results_dir: 'https://www.ebi.ac.uk/metagenomics/results/1',
    ...overrides,
  };
}

test.describe('V2 Analysis page', () => {
  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
  });

  test('renders correctly for Amplicon experiment type', async ({ page, mockApiWithData }) => {
    const acc = 'MGYA01000004';
    const data = stubAnalysisDetails(acc, 'amplicon');
    await mockApiWithData(`**/analyses/${acc}*`, data);

    await page.goto(`analyses/${acc}/overview`);

    // Breadcrumbs
    await expect(page.locator('.vf-breadcrumbs')).toBeVisible();
    await expect(page.locator('.vf-breadcrumbs__item').getByText('Home')).toBeVisible();
    await expect(page.locator('.vf-breadcrumbs__item').getByText('Studies')).toBeVisible();
    await expect(page.locator('.vf-breadcrumbs__item').getByText('MGYS0000001')).toBeVisible();
    await expect(page.locator('.vf-breadcrumbs__item').getByText(acc)).toBeVisible();

    // Heading
    await expect(page.locator('h2').getByText(`Analysis ${acc}`)).toBeVisible();

    // Tabs for Amplicon
    const tabs = page.locator('.vf-tabs');
    await expect(tabs.getByText('Overview')).toBeVisible();
    await expect(tabs.getByText('Quality control')).toBeVisible();
    await expect(tabs.getByText('Taxonomy')).toBeVisible();
    await expect(tabs.getByText('ASV')).toBeVisible();
    await expect(tabs.getByText('Downloads')).toBeVisible();
    await expect(tabs.getByText('Functional analysis')).not.toBeVisible();
    await expect(tabs.getByText('Pathways/Systems')).not.toBeVisible();
    await expect(tabs.getByText('Contig Viewer')).not.toBeVisible();

    await expect(page.url()).toContain('/overview');
  });

  test('renders correctly for Metagenomic experiment type', async ({ page, mockApiWithData }) => {
    const acc = 'MGYA00000005';
    const data = stubAnalysisDetails(acc, 'metagenomic');
    await mockApiWithData(`**/analyses/${acc}*`, data);

    await page.goto(`analyses/${acc}/overview`);

    // Heading
    await expect(page.locator('h2').getByText(`Analysis ${acc}`)).toBeVisible();

    // Tabs for Metagenomic
    const tabs = page.locator('.vf-tabs');
    await expect(tabs.getByText('Overview')).toBeVisible();
    await expect(tabs.getByText('Quality control')).toBeVisible();
    await expect(tabs.getByText('Taxonomy')).toBeVisible();
    await expect(tabs.getByText('Downloads')).toBeVisible();
    await expect(tabs.getByText('Functional analysis')).not.toBeVisible();
    await expect(tabs.getByText('Pathways/Systems')).not.toBeVisible();
    await expect(tabs.getByText('Contig Viewer')).not.toBeVisible();
    await expect(tabs.getByText('ASV')).not.toBeVisible();

    await expect(page.url()).toContain('/overview');
  });

  test('renders correctly for Assembly experiment type', async ({ page, mockApiWithData }) => {
    const acc = 'MGYA00000002';
    const data = stubAnalysisDetails(acc, 'assembly');
    await mockApiWithData(`**/analyses/${acc}*`, data);

    await page.goto(`analyses/${acc}/overview`);

    // Tabs for Assembly
    const tabs = page.locator('.vf-tabs');
    await expect(tabs.getByText('Overview')).toBeVisible();
    await expect(tabs.getByText('Quality control')).toBeVisible();
    await expect(tabs.getByText('Taxonomy')).toBeVisible();
    await expect(tabs.getByText('Functional analysis')).toBeVisible();
    await expect(tabs.getByText('Pathways/Systems')).toBeVisible();
    await expect(tabs.getByText('Contig Viewer')).toBeVisible();
    await expect(tabs.getByText('ASV')).not.toBeVisible();
  });

  test('navigates between tabs correctly', async ({ page, mockApiWithData }) => {
    const acc = 'MGYA00000003';
    const data = stubAnalysisDetails(acc, 'amplicon');
    await mockApiWithData(`**/analyses/${acc}*`, data);

    await page.goto(`analyses/${acc}/overview`);

    const tabs = page.locator('.vf-tabs');
    await tabs.getByText('Quality control').click();
    await expect(page.url()).toContain('/qc');

    await tabs.getByText('Taxonomy').click();
    await expect(page.url()).toContain('/taxonomic');

    await tabs.getByText('ASV').click();
    await expect(page.url()).toContain('/asv');
  });

  test('shows error message on API failure', async ({ page }) => {
    const acc = 'MGYA00000004';
    await page.route(`**/analyses/${acc}*`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [{ detail: 'Not found' }],
        }),
      });
    });

    await page.goto(`analyses/${acc}/overview`);

    await expect(page.getByText('Error Fetching Data')).toBeVisible();
    await expect(page.getByText('404')).toBeVisible();
  });
});
