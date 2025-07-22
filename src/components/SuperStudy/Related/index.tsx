import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useURLAccession from 'hooks/useURLAccession';
import { getBiomeIcon } from 'utils/biomes';
import useSuperStudyDetail from 'hooks/data/useSuperStudyDetail';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';

const RelatedTable: React.FC = () => {
  const slug = useURLAccession();
  const { data, loading, error } = useSuperStudyDetail(slug);

  if (loading) return <Loading size="small" />;
  if (error || !data) return <FetchError error={error} />;

  const columns = [
    {
      id: 'biome_id',
      Header: 'Biome',
      accessor: (study) => study.biome.lineage,
      Cell: ({ cell }) => (
        <span
          className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
          style={{ float: 'initial' }}
        />
      ),
      className: 'mg-biome',
    },
    {
      id: 'study',
      Header: 'Study accession',
      accessor: 'accession',
      Cell: ({ cell }) => (
        <Link to={`/studies/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Name',
      accessor: 'title',
    },
    // {
    //   Header: 'Samples Count',
    //   accessor: 'attributes.samples-count',
    // },
    {
      id: 'last_update',
      Header: 'Last Updated',
      accessor: 'updated_at',
      Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
    },
  ];

  return (
    <details>
      <summary>
        <b>Related Projects</b>
      </summary>
      <FixedHeightScrollable heightPx={640}>
        <EMGTable
          cols={columns}
          showPagination={false}
          data={data.related_studies}
          className="mg-anlyses-table"
          loading={loading}
          namespace="related-"
          dataCy="superStudyRelatedTable"
        />
      </FixedHeightScrollable>
    </details>
  );
};

export default RelatedTable;
