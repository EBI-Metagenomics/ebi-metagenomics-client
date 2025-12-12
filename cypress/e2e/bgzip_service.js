import { BGZipService } from 'components/Analysis/BgZipService';

describe('BGZipService with real .gz and .gzi files', () => {
  const dataUrl = `${Cypress.env('FIXTURE_BASE')}/bgzip/test_gzipped_data.tsv.gz`;
  const indexUrl = "test_gzipped_data.tsv.gz.gzi"

  it('initializes and reads a page of TSV from real BGZF file', () => {
    cy.then(async () => {
      expect(dataUrl).to.not.be.undefined;
      expect(indexUrl).to.not.be.undefined;

      const download = {
        url: dataUrl,
        index_files: [{ relative_url: indexUrl, index_type: 'gzi' }],
      };

      const service = new BGZipService(download, false);
      await service.initialize();

      const rows = await service.readPageAsTSV(1);

      expect(rows.length).to.be.greaterThan(0);
      expect(rows[0].length).to.be.greaterThan(0);
    });
  });
});

