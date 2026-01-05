// // / <reference types="cypress" />
//
// // E2E tests for V2 Assembly page component (src/pages/Assembly/v2index.tsx)
// // Requirement: use .js (not .cy.ts)
//
// const API_V2 = Cypress.env('API_V2') || 'https://www.ebi.ac.uk/metagenomics/api/v2';
//
// function stubAssemblyDetails(accession, overrides = {}) {
//   cy.intercept('GET', `**/assemblies/${accession}/genome-links`, {
//     statusCode: 200,
//     body: {
//       items: [],
//       ...overrides
//     }
//   }).as('assembly-details');
// }
//
// function stubAssemblyAnalyses(accession, fixture) {
//   const response = fixture || {
//     count: 1,
//     data: [
//       {
//         accession: 'MGYA00000001',
//         sample: { accession: 'ERS000001' },
//         assembly: { accession: accession },
//         run: null,
//         pipeline_version: 'v5.0'
//       }
//     ]
//   };
//   cy.intercept('GET', `**/studies/${accession}/analyses/*`, {
//     statusCode: 200,
//     body: response
//   }).as('assembly-analyses');
// }
//
// describe('V2 Assembly page', () => {
//   it('renders Derived genomes in Overview', () => {
//     const acc = 'GCA_TEST_V2_3';
//     const genomeAcc = 'MGYG000000001';
//
//     stubAssemblyDetails(acc, {
//       items: [
//         {
//           genome: {
//             accession: genomeAcc,
//             taxon_lineage: 'd__Bacteria',
//             catalogue_id: 'human-gut',
//             catalogue_version: '1.0'
//           },
//           species_rep: genomeAcc,
//           mag_accession: 'ERZ000001',
//           updated_at: '2023-01-01T00:00:00Z'
//         }
//       ]
//     });
//
//     cy.visit(`/metagenomics/v2-assemblies/${acc}#overview`);
//
//     cy.wait('@assembly-details');
//
//     cy.contains('Derived genomes');
//     cy.contains(genomeAcc);
//     cy.contains('ERZ000001');
//     cy.contains('human-gut v1.0');
//     cy.contains('Bacteria');
//   });
//
//
//   // it('renders Overview with ENA, Sample, Runs and empty Derived genomes', () => {
//   //   const acc = 'GCA_TEST_V2_1';
//   //
//   //   stubAssemblyDetails(acc);
//   //
//   //   cy.visit(`/metagenomics/v2-assemblies/${acc}#overview`);
//   //
//   //   cy.wait('@assembly-details');
//   //
//   //   cy.contains(`Assembly: ${acc}`);
//   //   cy.contains('Derived genomes');
//   //   cy.contains('No derived genomes found.');
//   // });
//
//   // it('renders Analyses tab and loads analyses via assemblies endpoint', () => {
//   //   const acc = 'GCA_TEST_V2_2';
//   //
//   //   stubAssemblyDetails(acc);
//   //   stubAssemblyAnalyses(acc);
//   //
//   //   cy.visit(`/metagenomics/v2-assemblies/${acc}#analyses`);
//   //
//   //   cy.wait(['@assembly-details', '@assembly-analyses']);
//   //
//   //   cy.contains('Associated analyses');
//   //   // The table component renders a heading "Analyses"
//   //   cy.contains('Analyses');
//   //
//   //   // Basic column checks (labels may come from the table component)
//   //   cy.contains('Analysis accession');
//   //   cy.contains('Sample accession');
//   //   cy.contains('Pipeline version');
//   //
//   //   // Row content
//   //   cy.contains('MGYA00000001');
//   //   cy.contains('ERS000001');
//   //   cy.contains('5.0');
//   // });
// });
