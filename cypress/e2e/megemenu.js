import {
  openPage,
} from '../util/util';
const origPage = '';

const megamenunavItems = [
  {
    id: 'submit-data-section',
    contentId: 'submit-data-content-section',
    links: [
      'https://www.ebi.ac.uk/ena/submit/webin/accountInfo',
    ]
  },
  {
    id: 'text-search-section',
    contentId: 'text-search-content-section',
    links: [
      '/metagenomics/search/studies',
      '/metagenomics/search/samples',
      '/metagenomics/search/analyses',
    ]
  },
  {
    id: 'browse-section',
    contentId: 'browse-content-section',
    links: [
      '/metagenomics/browse/super-studies',
      '/metagenomics/browse/studies',
      '/metagenomics/browse/samples',
      '/metagenomics/browse/publications',
      '/metagenomics/browse/genomes',
      '/metagenomics/browse/biomes',
    ],
  },
  {
    id: 'help-section',
    contentId: 'help-content-section',
    links: [
      'https://docs.mgnify.org/',
      'https://shiny-portal.embl.de/shinyapps/app/06_mgnify-notebook-lab?jlpath=mgnify-examples/home.ipynb',
      'https://hmmer-web-docs.readthedocs.io/en/latest/index.html',
      'http://ftp.ebi.ac.uk/pub/databases/metagenomics/peptide_database/current_release/README.txt',
      'https://www.ebi.ac.uk/training/about',
      'https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-quick-tour',
      'https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-submitting-metagenomics-da',
      'https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-analysing-and-exploring-metagenomics-data',
      'https://www.ebi.ac.uk/training/online/course/metagenomics-bioinformatics',
      'https://www.ebi.ac.uk/about/contact/support/metagenomics'
    ],
  },
]
describe('MegaMenu Component', () => {
  beforeEach(() => {
    openPage(origPage);
  });

  it('should be able to access all links inside the MegaMenu', () => {
    megamenunavItems.forEach((item) => {
      cy.get(`#${item.id}`).trigger('mouseover');
      if (item.links) {
        item.links.forEach((link) => {
          cy.get(`#${item.contentId} a[href="${link}"]`).should('be.visible');
        });
      }

    });
  });

});
