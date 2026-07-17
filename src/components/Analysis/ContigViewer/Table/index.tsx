import React, { useContext, useMemo } from 'react';

import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import Tooltip from 'components/UI/Tooltip';
import ContigsQueryContext from 'components/Analysis/ContigViewer/ContigsQueryContext';

import './style.css';

import ArrowForLink from 'components/UI/ArrowForLink';
import CursorPagination from 'components/UI/EMGTable/CursorPagination';
import TruncatedText from 'components/UI/TextTruncated';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import {
  useCrates,
  useOfflineCrate,
} from 'hooks/genomeViewer/CrateStore/useCrates';
import { MGnifyDatum } from 'hooks/data/useData';

type ContigFeatureProps = {
  annotationType: string;
  present: boolean;
};

export const ContigFeatureFlag: React.FC<ContigFeatureProps> = ({
  annotationType,
  present,
}) => {
  let color;
  let letter = annotationType[0].toUpperCase();
  switch (annotationType) {
    case 'cog':
      color = '#3b6fb6';
      break;
    case 'kegg':
      color = '#18974c';
      break;
    case 'pfam':
      color = '#193f90';
      letter = 'Pf';
      break;
    case 'interpro':
      color = '#734595';
      letter = 'IP';
      break;
    case 'go':
      color = '#f49e17';
      letter = 'GO';
      break;
    case 'gene':
      color = '#707372';
      letter = 'Gn';
      break;
    case 'antismash':
      color = '#b65417';
      letter = 'AS';
      break;
    case 'antismash-function':
      color = '#b65417';
      letter = 'AF';
      break;
    case 'rfam':
      color = '#501D0A';
      letter = 'Rf';
      break;
    case 'mibig':
      color = '#2D67AF';
      letter = 'MB';
      break;
    case 'eggnog':
      color = '#736EBD';
      letter = 'Eg';
      break;
    case 'ec':
      color = '#00876c';
      letter = 'EC';
      break;
    case 'gecco':
      color = '#587435';
      letter = 'Ge';
      break;
    case 'dbcan':
      color = '#9CB5EE';
      letter = 'Cz';
      break;
    case 'dbcan-pul':
      color = '#9CB5EE';
      letter = 'CP';
      break;
    case 'dbcan-sub':
      color = '#9CB5EE';
      letter = 'CS';
      break;
    case 'amr':
      color = '#d55e00';
      letter = 'AM';
      break;
    case 'amr-drug':
      color = '#d55e00';
      letter = 'AD';
      break;
    case 'amr-subdrug':
      color = '#d55e00';
      letter = 'AS';
      break;
    case 'amr-element':
      color = '#d55e00';
      letter = 'AE';
      break;
    case 'amr-subelement':
      color = '#d55e00';
      letter = 'AT';
      break;
    case 'mobile':
      color = '#cc79a7';
      letter = 'Mo';
      break;
    case 'defense':
      color = '#882255';
      letter = 'Df';
      break;
    case 'virus':
      color = '#44aa99';
      letter = 'Vi';
      break;
    case 'viphog':
      color = '#44aa99';
      letter = 'Vg';
      break;
    case 'trna':
      color = '#009e73';
      break;
    case 'ncrna':
      color = '#3582B0';
      break;
    default:
      color = '#8d8f8e';
  }
  if (!present) {
    color += '55';
  }
  const tooltip = `${
    present ? 'Has' : 'Doesn’t have'
  } ${annotationType} annotations`;
  return (
    <Tooltip content={tooltip}>
      <div
        className="emg-contig-feature-flag vf-text vf-text-body--4"
        style={{ borderColor: color, color }}
      >
        {letter}
      </div>
    </Tooltip>
  );
};

const ContigsTable: React.FC = () => {
  const { contigsQueryData } = useContext(ContigsQueryContext);
  const { data, loading, error } = contigsQueryData || {};
  const [, setSelectedContig] = useQueryParamState('selectedContig');
  const [, setContigsPageCursor] = useQueryParamState('contigsPageCursor');

  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);
  const assemblyId = (analysisOverviewData as MGnifyDatum | null)?.relationships
    ?.assembly?.data?.id;
  const { crates, loading: loadingCrates } = useCrates(
    `assemblies/${assemblyId}/extra-annotations`
  );
  const { crate: offlineCrate, isUploading: loadingOfflineCrate } =
    useOfflineCrate();

  const allCrates = useMemo(() => {
    const cratesIncludingOffline = [...crates];
    if (offlineCrate) {
      cratesIncludingOffline.push(offlineCrate);
    }
    return cratesIncludingOffline;
  }, [crates, offlineCrate]);

  const contigsColumns = useMemo(() => {
    const cols = [
      {
        id: 'contig_id',
        Header: 'Name',
        accessor: (contig) => contig.attributes['contig-id'],
        Cell: ({ cell }) => (
          <button
            className="vf-button vf-button--link vf-button--sm contig-id-button"
            type="button"
            onClick={() => setSelectedContig(cell.value)}
          >
            <TruncatedText text={cell.value} withTooltip maxLength={24} />
            <ArrowForLink />
          </button>
        ),
      },
      {
        id: 'length',
        Header: 'Length (bp)',
        accessor: (contig) => contig.attributes.length,
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
      {
        id: 'coverage',
        Header: 'Coverage',
        accessor: (contig) => contig.attributes.coverage,
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
      {
        id: 'features',
        Header: 'Features',
        accessor: (contig) => contig.attributes,
        Cell: ({ cell }) => {
          const flags = Object.entries(cell.value)
            .filter(([key]) => key.startsWith('has-'))
            .map(([key, value]) => (
              <ContigFeatureFlag
                key={key}
                annotationType={key.substring(4)}
                present={!!value}
              />
            ));
          return <div className="emg-contig-feature-flags">{flags}</div>;
        },
      },
    ];
    if (allCrates) {
      cols.push({
        id: 'crates',
        Header: 'RO-Crates',
        accessor: (contig) => contig.attributes['contig-id'],
        Cell: ({ cell }) => {
          const crateFlags = allCrates.map((crate) => (
            <ContigFeatureFlag
              key={crate.url}
              annotationType={crate.track?.label?.substring(0) ?? ''}
              present={(crate?.asciigff?.indexOf(cell.value) || 0) >= 0}
            />
          ));
          return <div className="emg-contig-feature-flags">{crateFlags}</div>;
        },
      });
    }
    return cols;
  }, [setSelectedContig, allCrates]);

  if (error) return <FetchError error={error} />;
  if (!data) return null;

  return (
    <div>
      <EMGTable
        cols={contigsColumns}
        data={data}
        showPagination={false}
        Title={<>Assembly Contigs ({(data as any).meta.pagination.count})</>} // TODO
        initialPage={0}
        className="mg-contigs-table"
        namespace="contigs_"
        isStale={loading || loadingCrates || loadingOfflineCrate}
        showTextFilter
      />
      <CursorPagination
        paginationLinks={(data as any).links} // TODO
        handleCursor={(cursor) => setContigsPageCursor(cursor)}
      />
    </div>
  );
};

export default ContigsTable;
