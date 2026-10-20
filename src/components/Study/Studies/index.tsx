import React from 'react';
import { Link } from 'react-router-dom';
import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import { PublicationStudy, Study } from '@/interfaces';

type AssociatedStudiesProps = {
  associatedStudies: PublicationStudy[] | Study[];
};
const AssociatedStudies: React.FC<AssociatedStudiesProps> = ({
  associatedStudies,
}) => {
  const columns = [
    {
      id: 'biome_id',
      header: 'Biome',
      accessorFn: (study) => study.biome?.lineage,
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
    //   Header: 'Abstract',
    //   accessor: 'attributes.study-abstract',
    //   cell: ({ cell }) => <TruncatedText text={(cell.getValue() as string) || ''} />,
    // },
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
    <EMGTable
      cols={columns}
      data={associatedStudies as Record<string, any>[]}
      className="mg-studies-table"
      showPagination={false}
      // downloadURL={downloadURL}
      dataCy="associated-studies"
    />
  );
};

export default AssociatedStudies;
