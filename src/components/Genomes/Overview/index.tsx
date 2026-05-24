import React from 'react';
import KeyValueList, { KeyValueItemsList } from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import {
  ENA_VIEW_URL,
  IMG_URL,
  NCBI_ASSEMBLY_URL,
  PATRIC_URL,
} from '@/utils/urls';
import { cleanTaxLineage } from 'utils/taxon.ts';

type GenomeOverviewProps = {
  data: any;
};

function notEmpty(listValue: unknown): boolean {
  return (
    !!listValue &&
    listValue !== 'null' &&
    listValue !== 'null%' &&
    listValue !== 'undefined' &&
    listValue !== 'undefined%'
  );
}

const GenomeOverview: React.FC<GenomeOverviewProps> = ({ data }) => {
  console.log('DATA OUT HERE ', data);
  return (
    <section id="overview">
      <div className="vf-stack">
        <details open>
          <summary>
            <b>Genome statistics</b>
          </summary>

          <KeyValueList
            list={[
              { key: 'Type', value: data.type as string },
              { key: 'Length (bp)', value: String(data.length) },
              { key: 'Contamination', value: `${data.contamination}%` },
              { key: 'Completeness', value: `${data.completeness}%` },
              { key: 'Num. of contigs', value: String(data.num_contigs) },
              {
                key: 'Total number of genomes in species',
                value: String(data.num_genomes_total),
              },
              {
                key: 'Number of proteins',
                value: String(data.num_proteins),
              },
              {
                key: 'GC content',
                value:
                  data.gc_content != null
                    ? `${data.gc_content.toFixed(2)}%`
                    : undefined,
              },
              {
                key: 'Taxonomic lineage',
                value: cleanTaxLineage(data.taxon_lineage as string, ' > '),
              },
              { key: 'N50', value: String(data.n_50) },
            ].filter(({ value }) => notEmpty(value))}
          />
        </details>
        <details open>
          <summary>
            <b>Genome annotations</b>
          </summary>
          <KeyValueList
            list={[
              {
                key: 'InterPro coverage',
                value: `${data.ipr_coverage}%`,
              },
              {
                key: 'EggNog coverage',
                value: `${data.eggnog_coverage}%`,
              },
            ].filter(({ value }) => notEmpty(value))}
          />
        </details>

        <details open>
          <summary>
            <b>Genome RNA coverage</b>
          </summary>
          <KeyValueList
            list={[
              {
                key: 'rRNA 5S total gene length coverage',
                value: `${data.rna_5s}%`,
              },
              {
                key: 'rRNA 5.8S total gene length coverage',
                value: `${data.rna_5_8s}%`,
              },
              {
                key: 'rRNA 16S total gene length coverage',
                value: `${data.rna_16s}%`,
              },
              {
                key: 'rRNA 18S total gene length coverage',
                value: `${data.rna_18s}%`,
              },
              {
                key: 'rRNA 23S total gene length coverage',
                value: `${data.rna_23s}%`,
              },
              {
                key: 'rRNA 28S total gene length coverage',
                value: `${data.rna_28s}%`,
              },
              {
                key: 'tRNAs',
                value: `${data.trnas}`,
              },
              {
                key: 'ncRNA',
                value: `${data.nc_rnas}`,
              },
            ].filter(({ value }) => notEmpty(value))}
          />
        </details>

        {/* Legacy annotation, pan-genome, and RNA sections removed: new API does not provide these fields */}
        <details open>
          <summary>
            <b>Geographic metadata</b>
          </summary>
          <KeyValueList
            list={[
              {
                key: 'Origin of representative genome',
                value: data.geographic_origin as string,
              },
              {
                key: 'Geographic range of pan-genome',
                value: Array.isArray(data.geographic_range)
                  ? (data.geographic_range as string[]).join(', ')
                  : undefined,
              },
            ].filter(({ value }) => notEmpty(value))}
          />
        </details>
        <details open>
          <summary>
            <b>External links</b>
          </summary>
          <KeyValueList
            list={
              [
                {
                  key: 'ENA genome accession',
                  value: data.ena_genome_accession
                    ? () => (
                        <ExtLink
                          href={ENA_VIEW_URL + data.ena_genome_accession}
                        >
                          {data.ena_genome_accession}
                        </ExtLink>
                      )
                    : null,
                },
                {
                  key: 'ENA sample accession',
                  value: data.ena_sample_accession
                    ? () => (
                        <ExtLink
                          href={ENA_VIEW_URL + data.ena_sample_accession}
                        >
                          {data.ena_sample_accession}
                        </ExtLink>
                      )
                    : null,
                },
                {
                  key: 'IMG genome accession',
                  value: data.img_genome_accession
                    ? () => (
                        <ExtLink href={IMG_URL + data.img_genome_accession}>
                          {data.img_genome_accession}
                        </ExtLink>
                      )
                    : null,
                },
                {
                  key: 'NCBI genome accession',
                  value: data.ncbi_genome_accession
                    ? () => (
                        <ExtLink
                          href={NCBI_ASSEMBLY_URL + data.ncbi_genome_accession}
                        >
                          {data.ncbi_genome_accession}
                        </ExtLink>
                      )
                    : null,
                },
                {
                  key: 'PATRIC genome accession',
                  value: data.patric_genome_accession
                    ? () => (
                        <ExtLink
                          href={PATRIC_URL + data.patric_genome_accession}
                        >
                          {data.patric_genome_accession}
                        </ExtLink>
                      )
                    : null,
                },
              ].filter(({ value }) => notEmpty(value)) as KeyValueItemsList
            }
          />
        </details>
      </div>
    </section>
  );
};
export default GenomeOverview;
