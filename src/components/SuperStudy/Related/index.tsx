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
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const columns = [
    {
      id: 'biome_id',
      header: 'Biome',
      accessorFn: (study) => study.biome.lineage,
      cell: ({ cell }) => (
        <span
          className={`biome_icon icon_xs ${getBiomeIcon(cell.getValue())}`}
          style={{ float: 'initial' }}
        />
      ),
      meta: { className: 'mg-biome' },
    },
    {
      id: 'study',
      header: 'Study accession',
      accessorKey: 'accession',
      cell: ({ cell }) => (
        <Link to={`/studies/${cell.getValue()}`}>{cell.getValue()}</Link>
      ),
    },
    {
      header: 'Name',
      accessorKey: 'title',
    },
    // {
    //   Header: 'Samples Count',
    //   accessor: 'attributes.samples-count',
    // },
    {
      id: 'last_update',
      header: 'Last Updated',
      accessorKey: 'updated_at',
      cell: ({ cell }) => <>{new Date(cell.getValue()).toLocaleDateString()}</>,
    },
  ];

  return (
    <details open={data.flagship_studies.length === 0}>
      <summary>
        <b>Related Projects</b>
      </summary>
      <FixedHeightScrollable heightPx={480}>
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
