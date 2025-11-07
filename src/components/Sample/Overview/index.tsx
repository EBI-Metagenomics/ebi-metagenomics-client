import React, { useMemo } from 'react';
import SamplesMap from 'components/UI/SamplesMap/BySamplesArray';
import Box from 'components/UI/Box';
import ExtLink from 'components/UI/ExtLink';
import { getBiomeIcon } from '@/utils/biomes';
import { ENA_VIEW_URL } from '@/utils/urls';
import { SampleDetail, Study } from '@/interfaces';
import { find } from 'lodash-es';
import InfoBanner from 'components/UI/InfoBanner';

type SampleOverviewProps = {
  data: SampleDetail;
};

const SampleOverview: React.FC<SampleOverviewProps> = ({ data }) => {
  const lineage = data.biome?.lineage ?? 'root';
  const biosample = useMemo(() => {
    return find(data?.ena_accessions ?? [], (acc) => acc.startsWith('SAM'));
  }, [data]);
  const study = data?.studies?.[0] as Study;

  return (
    <section>
      <div className="vf-grid">
        <div>
          <h4>
            Last updated: {new Date(data.updated_at as string).toDateString()}
          </h4>
          <Box label="Description" dataCy="sample-description">
            {data?.metadata?.sample_description}
          </Box>
          <Box label="External links">
            <ul data-cy="sample-external-links">
              <li>
                <ExtLink href={ENA_VIEW_URL + data.accession}>
                  ENA website ({data.accession})
                </ExtLink>
              </li>
              <li>
                {biosample ? (
                  <ExtLink
                    href={`https://www.ebi.ac.uk/biosamples/samples/${biosample}`}
                  >
                    EBI BioSamples ({biosample})
                  </ExtLink>
                ) : (
                  <InfoBanner
                    type="warning"
                    title="No BioSamples accession known"
                  ></InfoBanner>
                )}
              </li>
            </ul>
          </Box>
          <Box label="Classification">
            <span
              className={`biome_icon icon_sm ${getBiomeIcon(lineage)}`}
              style={{ float: 'initial' }}
            />
            {lineage}
          </Box>
        </div>
        <SamplesMap samples={[data]} study={study} />
      </div>
    </section>
  );
};

export default SampleOverview;
