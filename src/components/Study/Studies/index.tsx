import React from 'react';
import { Link } from 'react-router-dom';
import EMGTable from 'components/UI/EMGTable';
import { getBiomeIcon } from 'utils/biomes';
import { PublicationStudy } from 'interfaces';

type AssociatedStudiesProps = {
  associatedStudies: PublicationStudy[];
};
const AssociatedStudies: React.FC<AssociatedStudiesProps> = ({
  associatedStudies,
}) => {
  const columns = [
    {
      id: 'biome_id',
      Header: 'Biome',
      accessor: (study) => study.biome?.lineage,
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
    //   Header: 'Abstract',
    //   accessor: 'attributes.study-abstract',
    //   Cell: ({ cell }) => <TruncatedText text={(cell.value as string) || ''} />,
    // },
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
    <EMGTable
      cols={columns}
      data={associatedStudies as Record<string, never>[]}
      className="mg-studies-table"
      showPagination={false}
      // downloadURL={downloadURL}
      dataCy="associated-studies"
    />
  );
};

export default AssociatedStudies;
