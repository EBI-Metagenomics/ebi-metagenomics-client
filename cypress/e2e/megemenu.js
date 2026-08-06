import {
  openPage,
} from '../util/util';

const megaMenuExpandableItems = [
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
      '/metagenomics/search/analyses',
      '/metagenomics/search',
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
      '/metagenomics/help',
      'https://docs.mgnify.org/',
      'https://shiny-portal.embl.de/shinyapps/app/06_mgnify-notebook-lab?jlpath=mgnify-examples/home.ipynb',
      'https://hmmer-web-docs.readthedocs.io/en/latest/index.html',
      'http://ftp.ebi.ac.uk/pub/databases/metagenomics/peptide_database/current_release/README.txt',
      'https://www.ebi.ac.uk/training/services/mgnify',
      'https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-quick-tour',
      'https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-submitting-metagenomics-da',
      'https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-analysing-and-exploring-metagenomics-data',
      'https://www.ebi.ac.uk/training/materials/metagenomics-bioinformatics-at-mgnify-materials/',
      'https://status.mgnify.org/',
      'https://www.ebi.ac.uk/about/contact/support/metagenomics'
    ],
  },
];

const megaMenuDirectLinks = [
  {
    id: 'sequence-search-link',
    href: 'https://www.ebi.ac.uk/metagenomics/proteins/',
  },
  {
    text: 'MGnify Genomes',
    href: '/metagenomics/browse/genomes',
  },
  {
    id: 'login-link',
    href: '/metagenomics/login',
  },
];

describe('MegaMenu Component', () => {
  beforeEach(() => {
    openPage('');
  });

  it('should be able to access all links inside the MegaMenu', () => {
    megaMenuExpandableItems.forEach((item) => {
      cy.get(`#${item.id}`).trigger('click');
      if (item.links) {
        item.links.forEach((link) => {
          cy.get(`#${item.contentId} a[href="${link}"]`).should('be.visible');
        });
      }
    });
  });

  it('should expose the direct MegaMenu links', () => {
    megaMenuDirectLinks.forEach((item) => {
      const selector = item.id
        ? `#${item.id}`
        : `#mgnify-mega-menu a[href="${item.href}"]`;

      cy.get(selector)
        .should('be.visible')
        .and('have.attr', 'href', item.href);

      if (item.text) {
        cy.get(selector).should('contain', item.text);
      }
    });
  });
});
