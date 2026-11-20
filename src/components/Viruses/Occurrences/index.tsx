import React from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { ViralFragmentOccurrence } from '@/interfaces';
import EMGTable from 'components/UI/EMGTable';
import ExtLink from 'components/UI/ExtLink';
import useQueryParamState, {
  createSharedQueryParamContextForTable,
} from '@/hooks/queryParamState/useQueryParamState';

const SourceLink: React.FC<{ occurrence: ViralFragmentOccurrence }> = ({
  occurrence,
}) => {
  if (occurrence.analysis_accession)
    return (
      <Link to={`/analyses/${occurrence.analysis_accession}`}>
        {occurrence.analysis_accession}
      </Link>
    );
  if (occurrence.catalogue_genome_id && occurrence.source_genome_accession) {
    return (
      <Link
        to={`/genomes/${
          occurrence.source_genome_accession
        }?${new URLSearchParams({
          catalogue: occurrence.genome_catalogue_id || '',
        })}`}
      >
        {occurrence.source_genome_accession}
      </Link>
    );
  }
  return (
    <ExtLink
      href={`https://www.ebi.ac.uk/ena/browser/view/${encodeURIComponent(
        occurrence.source_accession
      )}`}
    >
      {occurrence.source_accession}
    </ExtLink>
  );
};

const columns: ColumnDef<ViralFragmentOccurrence>[] = [
  { header: 'Fragment', accessorKey: 'fragment_accession' },
  {
    header: 'Source',
    accessorKey: 'source_accession',
    cell: ({ row }) => <SourceLink occurrence={row.original} />,
  },
  {
    header: 'Type',
    accessorKey: 'source_type',
    cell: ({ row }) =>
      row.original.source_type === 'genome' ? 'Genome' : 'Assembly analysis',
  },
  { header: 'Original sequence', accessorKey: 'original_id' },
  { header: 'Source genome catalogue', accessorKey: 'genome_catalogue_id' },
  { header: 'Sample', accessorKey: 'source_sample' },
  { header: 'Study', accessorKey: 'source_study' },
];

const Occurrences: React.FC<{
  occurrences: ViralFragmentOccurrence[];
  namespace: string;
}> = ({ occurrences, namespace }) => {
  const [page] = useQueryParamState<number>(`${namespace}Page`);
  return (
    <EMGTable
      cols={columns}
      data={{ items: occurrences, count: occurrences.length }}
      namespace={namespace}
      dataCy={namespace}
      initialPage={(page || 1) - 1}
      expectedPageSize={10}
      clientSidePagination
      horizontalScroll
    />
  );
};

const representativeParams = createSharedQueryParamContextForTable(
  'representativeOccurrences'
);
const memberParams = createSharedQueryParamContextForTable('memberOccurrences');

export const RepresentativeOccurrences =
  representativeParams.withQueryParamProvider(
    ({ occurrences }: { occurrences: ViralFragmentOccurrence[] }) => (
      <Occurrences
        namespace="representativeOccurrences"
        occurrences={occurrences}
      />
    )
  );
export const MemberOccurrences = memberParams.withQueryParamProvider(
  ({ occurrences }: { occurrences: ViralFragmentOccurrence[] }) => (
    <Occurrences namespace="memberOccurrences" occurrences={occurrences} />
  )
);
