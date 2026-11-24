import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import useApiData from '@/hooks/data/useApiData';
import { ViralFragment } from '@/interfaces';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import ExtLink from 'components/UI/ExtLink';
import EMGTable from 'components/UI/EMGTable';
import { TSVCell } from 'components/UI/CompressedTSVTable';
import UserContext from 'pages/Login/UserContext';

const ViralFragmentPage: React.FC = () => {
  const { catalogueId = '', accession = '' } = useParams();
  const { config } = useContext(UserContext);
  const { data, loading, error } = useApiData<ViralFragment>({
    url: `${config.api_v2}viruses/catalogues/${catalogueId}/fragments/${accession}`,
  });
  if (error) return <FetchError error={error} />;
  if (loading || !data) return <Loading />;
  const rows = data.metadata_rows ?? [];
  const kind = data.sequence_type === 'plasmid' ? 'plasmids' : 'viruses';
  const columns = Object.keys(rows[0] ?? {}).map((key) => ({
    id: key,
    header: key,
    accessorFn: (row: Record<string, string>) => row[key],
    cell: ({ getValue }) => <TSVCell value={getValue()} />,
  }));
  return (
    <section className="vf-content">
      <Breadcrumbs
        links={[
          { label: 'Home', url: '/' },
          { label: 'MGnify Viruses', url: '/viruses' },
          { label: catalogueId, url: `/viruses/${catalogueId}/${kind}` },
          { label: accession },
        ]}
      />
      <h2>
        {kind === 'plasmids' ? 'Plasmid' : 'Viral'} cluster representative{' '}
        {accession}
      </h2>
      <p>Metadata rows for this representative and its cluster members.</p>
      <p>
        Sourced from{' '}
        <ExtLink href={data.metadata_url ?? ''}>
          {kind}-all-metadata.tsv.gz
        </ExtLink>
        .
      </p>
      <EMGTable
        cols={columns}
        data={{ items: rows, count: rows.length }}
        horizontalScroll
      />
    </section>
  );
};
export default ViralFragmentPage;
