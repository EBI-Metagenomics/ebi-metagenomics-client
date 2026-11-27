# Molecule search

The Search navigation menu contains Text search and Search by molecule.
The molecule page uses the configured `api_v2` backend.
Deploy the matching API migrations and endpoints first.

Inputs:

- SMILES text.
- ChEBI names or identifiers through the candidate picker.
- A standalone Ketcher structure editor.

All three inputs use the same IDSM-backed search endpoint.
Selecting a ChEBI candidate fills the SMILES field.
The Draw a molecule button opens Ketcher in the shared EMGModal popup.
Opening Ketcher imports the current SMILES.
Search this drawing exports the edited structure into the same search and closes the popup.
Closing the popup without searching preserves the original SMILES.
The fixed similarity threshold is 0.8.

Ketcher loads only when the drawing panel opens.
Its standalone chemistry runs in the browser without a separate service.
The editor adds a substantial optional download.

Each result is an assembly analysis with its matching ChEBI identifiers and best similarity score.
The analysis link opens the normal analysis page.
Results use pages of 50 analyses.
The global search stores molecule presence per analysis, rather than protein assignments.

## Contig browser

The existing Search all field searches GFF attribute text stored in IndexedDB.
GFF attributes containing a ChEBI identifier are searchable without a dedicated ChEBI typeahead.
The feature-coordinate index supports jumps to matching CDS locations.
The whole-word option avoids partial identifier matches.

Current production merged GFFs do not necessarily contain Rhea/ChEBI attributes.
The current ASA GFF-builder inputs omit the Rhea table.
Pipeline enrichment and updated GFF files are required before a global ChEBI hit reliably supports local contig search.
The global results therefore retain ordinary analysis links.

Browser tests in `tests/molecule-search.spec.ts` mock provider-facing API responses.
They exercise standalone Ketcher import/export and synthetic ChEBI GFF indexing with feature coordinates.

## Molecule lists and Rhea drill-down

The global page lists all ChEBI identifiers returned by IDSM, with similarity scores.
The list remains visible when those molecules have no indexed analysis matches.

An analysis accession opens its Functional analysis Rhea tab.
Each matched molecule opens the same tab with a prefilled search dialog.
Example: `/analyses/MGYA00000002/functional?type=rhea&chebi=CHEBI%3A15361`.
The existing dialog retains its full-file search confirmation.
ChEBI searches default to whole-word matching to avoid matching longer identifiers.
The table accepts both headered and headerless Rhea downloads.
