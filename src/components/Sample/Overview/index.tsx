import React from 'react';

import { MGnifyDatum } from 'hooks/data/useData';
import SamplesMap from 'components/UI/SamplesMap/BySamplesArray';
import Box from 'components/UI/Box';
import ExtLink from 'components/UI/ExtLink';
import { getBiomeIcon } from 'utils/biomes';

type SampleOverviewProps = {
  data: MGnifyDatum;
};

const SampleOverview: React.FC<SampleOverviewProps> = ({ data }) => {
  const lineage = data.relationships.biome.data.id;
  return (
    <section>
      <div className="vf-grid">
        <div>
          <h4>
            Last updated:{' '}
            {new Date(
              data?.attributes?.['last-update'] as string
            ).toDateString()}
          </h4>
          <Box label="Description">{data.attributes['sample-desc']}</Box>
          <Box label="External links">
            <ul>
              <li>
                <ExtLink
                  href={`https://www.ebi.ac.uk/ena/browser/view/${data.attributes.accession}`}
                >
                  ENA website ({data.attributes.accession})
                </ExtLink>
              </li>
              <li>
                <ExtLink
                  href={`https://www.ebi.ac.uk/biosamples/samples/${data.attributes.biosample}`}
                >
                  EBI biosample ({data.attributes.biosample})
                </ExtLink>
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
        <SamplesMap samples={[data]} />
      </div>
    </section>
  );
};

export default SampleOverview;
