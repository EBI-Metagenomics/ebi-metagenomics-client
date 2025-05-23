import React from 'react';
import KeyValueList from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import { MGnifyDatum } from 'hooks/data/useData';
import { cleanTaxLineage } from 'utils/taxon';
import {
  ENA_VIEW_URL,
  IMG_URL,
  NCBI_ASSEMBLY_URL,
  NCBI_PROJECT_URL,
  NCBI_SAMPLE_URL,
  PATRIC_URL,
} from 'utils/urls';

type GenomeOverviewProps = {
  data: MGnifyDatum;
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
  return (
    <section id="overview">
      <div className="vf-stack">
        <details open>
          <summary>
            <b>Genome statistics</b>
          </summary>

          <KeyValueList
            list={[
              { key: 'Type', value: data.attributes.type as string },
              { key: 'Length (bp)', value: String(data.attributes.length) },
              {
                key: 'Contamination',
                value: `${data.attributes.contamination}%`,
              },
              {
                key: data.attributes['busco-completeness']
                  ? 'Completeness (EukCC)'
                  : 'Completeness',
                value: `${data.attributes.completeness}%`,
              },
              {
                key: 'Completeness (BUSCO)',
                value: `${data.attributes['busco-completeness']}%`,
              },
              {
                key: 'Num. of contigs',
                value: String(data.attributes['num-contigs']),
              },
              {
                key: 'Total number of genomes in species',
                value: String(data.attributes['num-genomes-total']),
              },
              {
                key: 'Non-redundant number of genomes in species',
                value: String(data.attributes['num-genomes-non-redundant']),
              },
              {
                key: 'Number of proteins',
                value: String(data.attributes['num-proteins']),
              },
              { key: 'GC content', value: `${data.attributes['gc-content']}%` },
              {
                key: 'Taxonomic lineage',
                value: cleanTaxLineage(
                  data.attributes['taxon-lineage'] as string,
                  ' > '
                ),
              },
              { key: 'N50', value: String(data.attributes['n-50']) },
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
                value: `${data.attributes['ipr-coverage']}%`,
              },
              {
                key: 'EggNog coverage',
                value: `${data.attributes['eggnog-coverage']}%`,
              },
            ].filter(({ value }) => notEmpty(value))}
          />
        </details>
        {notEmpty(data.attributes['pangenome-size']) && (
          <details open>
            <summary>
              <b>Pan-genome statistics</b>
            </summary>
            <KeyValueList
              list={[
                {
                  key: 'Pan-genome size',
                  value: `${data.attributes['pangenome-size']}`,
                },
                {
                  key: 'Pan-genome core size',
                  value: `${data.attributes['pangenome-core-size']}`,
                },
                {
                  key: 'Pan-genome accessory size',
                  value: `${data.attributes['pangenome-accessory-size']}`,
                },
              ].filter(({ value }) => notEmpty(value))}
            />
          </details>
        )}
        <details open>
          <summary>
            <b>Genome RNA coverage</b>
          </summary>
          <KeyValueList
            list={[
              {
                key: 'rRNA 5S total gene length coverage',
                value: `${data.attributes['rna-5s']}%`,
              },
              {
                key: 'rRNA 5.8S total gene length coverage',
                value: `${data.attributes['rna-5-8s']}%`,
              },
              {
                key: 'rRNA 16S total gene length coverage',
                value: `${data.attributes['rna-16s']}%`,
              },
              {
                key: 'rRNA 18S total gene length coverage',
                value: `${data.attributes['rna-18s']}%`,
              },
              {
                key: 'rRNA 23S total gene length coverage',
                value: `${data.attributes['rna-23s']}%`,
              },
              {
                key: 'rRNA 28S total gene length coverage',
                value: `${data.attributes['rna-28s']}%`,
              },
              {
                key: 'tRNAs',
                value: `${data.attributes.trnas}`,
              },
              {
                key: 'ncRNA',
                value: `${data.attributes['nc-rnas']}`,
              },
            ].filter(({ value }) => notEmpty(value))}
          />
        </details>
        <details open>
          <summary>
            <b>Geographic metadata</b>
          </summary>
          <KeyValueList
            list={[
              {
                key: 'Origin of representative genome',
                value: data.attributes['geographic-origin'] as string,
              },
              {
                key: 'Geographic range of pan-genome',
                value: (data.attributes['geographic-range'] as string[]).join(
                  ', '
                ),
              },
            ]}
          />
        </details>
        <details open>
          <summary>
            <b>External links</b>
          </summary>
          <KeyValueList
            list={[
              {
                key: 'ENA genome accession',
                value: data.attributes['ena-genome-accession']
                  ? () => (
                      <ExtLink
                        href={
                          ENA_VIEW_URL + data.attributes['ena-genome-accession']
                        }
                      >
                        {data.attributes['ena-genome-accession']}
                      </ExtLink>
                    )
                  : null,
              },
              {
                key: 'ENA sample accession',
                value: data.attributes['ena-sample-accession']
                  ? () => (
                      <ExtLink
                        href={
                          ENA_VIEW_URL + data.attributes['ena-sample-accession']
                        }
                      >
                        {data.attributes['ena-sample-accession']}
                      </ExtLink>
                    )
                  : null,
              },
              {
                key: 'ENA study accession',
                value: data.attributes['ena-study-accession']
                  ? () => (
                      <ExtLink
                        href={
                          ENA_VIEW_URL + data.attributes['ena-study-accession']
                        }
                      >
                        {data.attributes['ena-study-accession']}
                      </ExtLink>
                    )
                  : null,
              },
              {
                key: 'IMG genome accession',
                value: data.attributes['img-genome-accession']
                  ? () => (
                      <ExtLink
                        href={IMG_URL + data.attributes['img-genome-accession']}
                      >
                        {data.attributes['img-genome-accession']}
                      </ExtLink>
                    )
                  : null,
              },
              {
                key: 'NCBI genome accession',
                value: data.attributes['ncbi-genome-accession']
                  ? () => (
                      <ExtLink
                        href={
                          NCBI_ASSEMBLY_URL +
                          data.attributes['ncbi-genome-accession']
                        }
                      >
                        {data.attributes['ncbi-genome-accession']}
                      </ExtLink>
                    )
                  : null,
              },
              {
                key: 'NCBI sample accession',
                value: data.attributes['ncbi-sample-accession']
                  ? () => (
                      <ExtLink
                        href={
                          NCBI_SAMPLE_URL +
                          data.attributes['ncbi-sample-accession']
                        }
                      >
                        {data.attributes['ncbi-sample-accession']}
                      </ExtLink>
                    )
                  : null,
              },
              {
                key: 'NCBI study accession',
                value: data.attributes['ncbi-study-accession']
                  ? () => (
                      <ExtLink
                        href={
                          NCBI_PROJECT_URL +
                          data.attributes['ncbi-study-accession']
                        }
                      >
                        {data.attributes['ncbi-study-accession']}
                      </ExtLink>
                    )
                  : null,
              },
              {
                key: 'PATRIC genome accession',
                value: data.attributes['patric-genome-accession']
                  ? () => (
                      <ExtLink
                        href={
                          PATRIC_URL +
                          data.attributes['patric-genome-accession']
                        }
                      >
                        {data.attributes['patric-genome-accession']}
                      </ExtLink>
                    )
                  : null,
              },
            ].filter(({ value }) => notEmpty(value))}
          />
        </details>
      </div>
    </section>
  );
};
export default GenomeOverview;
