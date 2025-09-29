import { BGZipService } from 'components/Analysis/BgZipService';

describe('BGZipService with real .gz and .gzi files', () => {
  let dataUrl;
  let indexUrl;

  before(() => {
    cy.fixture('bgzip/test_gzipped_data.tsv.gz', null).then((gzArrayBuffer) => {
      const gzBlob = new Blob([gzArrayBuffer], { type: 'application/gzip' });
      dataUrl = URL.createObjectURL(gzBlob);
    }).then(() => {
      return cy.fixture('bgzip/test_gzipped_data.tsv.gz.gzi', null).then((gziArrayBuffer) => {
        const gziBlob = new Blob([gziArrayBuffer], { type: 'application/octet-stream' });
        indexUrl = URL.createObjectURL(gziBlob);
      });
    });
  });

  it('initializes and reads a page of TSV from real BGZF file', () => {
    cy.then(async () => {
      expect(dataUrl).to.not.be.undefined;
      expect(indexUrl).to.not.be.undefined;

      const download = {
        url: dataUrl,
        index_file: { relative_url: indexUrl },
      };

      const service = new BGZipService(download, false);
      await service.initialize();

      const rows = await service.readPageAsTSV(1);

      expect(rows.length).to.be.greaterThan(0);
      expect(rows[0].length).to.be.greaterThan(0);
    });
  });
});

