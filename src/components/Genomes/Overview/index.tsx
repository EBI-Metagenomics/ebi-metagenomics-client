import React from 'react';
import KeyValueList, { KeyValueItemsList } from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import {
  ENA_VIEW_URL,
  IMG_URL,
  NCBI_ASSEMBLY_URL,
  PATRIC_URL,
} from '@/utils/urls';

type GenomeOverviewProps = {
  data: any;
};

function notEmpty(listValue: unknown): boolean {
  return (
    !!listValue &&
    listValue !== 'null' &&
    listValue !== 'undefined' &&
    listValue !== 'undefined%'
  );
}

const GenomeOverview: React.FC<GenomeOverviewProps> = ({ data }) => {
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
                key: 'GC content',
                value:
                  data.gc_content != null
                    ? `${(data.gc_content * 100).toFixed(2)}%`
                    : undefined,
              },
              { key: 'N50', value: String(data.n_50) },
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
            ]}
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
                        <ExtLink href={PATRIC_URL + data.patric_genome_accession}>
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
