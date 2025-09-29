import React, { useEffect, useMemo, useState } from 'react';
import { Download, PaginatedList } from 'interfaces/index';
import {
  Contig,
  db,
  importGffToIndexedDB,
  resetDb,
} from 'utils/locallyIndexedGff';
import { useEffectOnce } from 'react-use';
import { toast } from 'react-toastify';
import { BGZipService } from 'components/Analysis/BgZipService';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import { SharedTextQueryParam } from 'hooks/queryParamState/QueryParamStore/QueryParamContext';
import { ContigFeatureFlag } from 'components/Analysis/ContigViewer/Table';
import { useLGV } from 'components/Analysis/ContigViewer/V2ContigViewContext';
import ContigTypeaheadFilter from 'components/Analysis/ContigViewer/Filter/ContigFilterTypeahead';
import { Collection } from 'dexie';
import { KEYWORD_ANY } from 'components/UI/TextInputTypeahead';
import { filesize } from 'filesize';
import InfoBanner from 'components/UI/InfoBanner';

const {
  usePage,
  useInterproSearch,
  usePfamSearch,
  useCogCategorySearch,
  useKeggOrthlogSearch,
  useGeneOntologySearch,
  withQueryParamProvider,
} = createSharedQueryParamContextForTable('', {
  interproSearch: SharedTextQueryParam(''),
  pfamSearch: SharedTextQueryParam(''),
  cogCategorySearch: SharedTextQueryParam(''),
  keggOrthlogSearch: SharedTextQueryParam(''),
  geneOntologySearch: SharedTextQueryParam(''),
});

const getFileSize = async (dataFileUrl: string): Promise<number> => {
  const headResponse = await fetch(dataFileUrl, { method: 'HEAD' });
  const contentLength = Number(
    headResponse.headers.get('content-length') || '0'
  );
  console.debug(`Compressed file size: ${contentLength}`);
  return contentLength;
};

const annotationTypesForExistenceDisplay: {
  annotKeyInIndex: string;
  annotDisplay: string;
}[] = [
  {
    annotKeyInIndex: 'hasInterpros',
    annotDisplay: 'interpro',
  },
  {
    annotKeyInIndex: 'hasPfams',
    annotDisplay: 'pfam',
  },
  {
    annotKeyInIndex: 'hasCogs',
    annotDisplay: 'cog',
  },
  {
    annotKeyInIndex: 'hasKeggs',
    annotDisplay: 'kegg',
  },
  {
    annotKeyInIndex: 'hasGos',
    annotDisplay: 'go',
  },
];

const ContigSearch: React.FC<{
  gffDownload: Download;
  fastaDownload: Download;
  assemblyAccession: string;
}> = ({ gffDownload, fastaDownload, assemblyAccession }) => {
  const [gffSize, setGffSize] = useState<number>();
  const [existingIndexChecked, setExistingIndexChecked] =
    useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [isIndexed, setIsIndexed] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [interproSearch] = useInterproSearch<string>();
  const [pfamSearch] = usePfamSearch<string>();
  const [cogSearch] = useCogCategorySearch<string>();
  const [keggSearch] = useKeggOrthlogSearch<string>();
  const [goSearch] = useGeneOntologySearch<string>();

  const { navTo: navToContig, ready: isViewerReady } = useLGV();

  useEffect(() => {
    getFileSize(gffDownload.url).then(setGffSize);
  }, [gffDownload]);

  const [contigsTableData, setContigsTableData] = useState<
    PaginatedList<Contig>
  >({
    count: 0,
    items: [],
  } as PaginatedList<Contig>);
  const [pageNum, setPageNum] = usePage<number>();
  const PAGESIZE = 10;

  async function searchContigs(): Promise<PaginatedList<Contig>> {
    setIsStale(true);

    const page = Number(pageNum) || 1;
    const offset = (page - 1) * PAGESIZE;

    const contigsTable = db.contigs;
    let contigsColl: Collection<Contig> | null = null;

    const presenceIndexFor: Record<
      'interpros' | 'pfams' | 'cogs' | 'keggs' | 'gos',
      string
    > = {
      interpros: 'annotationsPresence.hasInterpros',
      pfams: 'annotationsPresence.hasPfams',
      cogs: 'annotationsPresence.hasCogs',
      keggs: 'annotationsPresence.hasKeggs',
      gos: 'annotationsPresence.hasGos',
    };

    const applyAttrFilter = (
      coll: Collection<Contig> | null,
      idxPath: 'interpros' | 'pfams' | 'cogs' | 'keggs' | 'gos',
      rawTerm?: string
    ): Collection<Contig> | null => {
      const term = (rawTerm || '').trim().toUpperCase();
      if (!term) return coll;

      if (term === KEYWORD_ANY) {
        // Presence-only: use the indexed boolean flag on the contig
        const base = contigsTable.where(presenceIndexFor[idxPath]).equals(1);
        return coll
          ? coll.and(
              (c) =>
                (c as any).annotationsPresence?.[
                  `has${idxPath.charAt(0).toUpperCase()}${idxPath.slice(1)}`
                ] === 1
            )
          : base;
      }

      // Exact match via multiEntry index on annotations.*
      const indexName = `annotations.${idxPath}`;
      const base = contigsTable.where(indexName).equals(term);
      return coll
        ? coll.and(
            (c) =>
              (
                (c.annotations as any)?.[idxPath] as string[] | undefined
              )?.includes(term) as boolean
          )
        : base;
    };

    // Apply all filters
    contigsColl = applyAttrFilter(contigsColl, 'interpros', interproSearch);
    contigsColl = applyAttrFilter(contigsColl, 'pfams', pfamSearch);
    contigsColl = applyAttrFilter(contigsColl, 'cogs', cogSearch);
    contigsColl = applyAttrFilter(contigsColl, 'keggs', keggSearch);
    contigsColl = applyAttrFilter(contigsColl, 'gos', goSearch);

    contigsColl = contigsColl || contigsTable.toCollection();

    const totalContigs = await contigsColl.count();
    const items = await contigsColl.offset(offset).limit(PAGESIZE).toArray();

    return { count: totalContigs, items };
  }

  useEffect(() => {
    if (!isIndexed) return;
    searchContigs()
      .then(setContigsTableData)
      .finally(() => setIsStale(false));
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIndexed, pageNum, interproSearch, pfamSearch]);

  useEffect(() => {
    if (!isIndexed) return;
    setPageNum(1);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interproSearch, pfamSearch]);

  useEffectOnce(() => {
    if (!isIndexed && !existingIndexChecked) {
      db.meta
        .get('sourceUrl')
        .then((row) => {
          if (row?.value && row.value === gffDownload.url) {
            console.debug(`File already indexed in local db: ${row.value}`);
            setIsIndexed(true);
            toast.success(`Contigs have been loaded from an earlier visit.`, {
              autoClose: 5000,
            });
          } else {
            resetDb();
          }
          setExistingIndexChecked(true);
        })
        .catch(() => setExistingIndexChecked(true));
    }
  });

  const contigsColumns = useMemo(
    () => [
      {
        Header: 'Contig ID',
        accessor: (row) => row.contigName,
        id: 'contig-id',
        Cell: ({ cell }) => (
          <button
            className="vf-button vf-button--link vf-button--sm contig-id-button"
            type="button"
            onClick={() => navToContig(cell.value)}
          >
            {cell.value}
          </button>
        ),
      },
      {
        Header: 'Length (bp)',
        accessor: (row) => row.length,
        id: 'length',
      },
      {
        Header: 'Features',
        accessor: (row) => row.annotationsPresence,
        id: 'features',
        Cell: ({ cell }) => {
          const flags = annotationTypesForExistenceDisplay.map(
            ({ annotKeyInIndex, annotDisplay }) => {
              return (
                <ContigFeatureFlag
                  key={annotKeyInIndex}
                  annotationType={annotDisplay}
                  present={cell.value?.[annotKeyInIndex] > 0}
                />
              );
            }
          );
          return <div className="emg-contig-feature-flags">{flags}</div>;
        },
      },
    ],
    [navToContig]
  );

  const gffIndex = BGZipService.getIndexFileUrl(gffDownload);
  if (!gffIndex) return <InfoBanner type="error" title="GFF index not found" />;

  const { start: fetchAndIndex, cancel: cancelFetchAndIndex } =
    importGffToIndexedDB({
      url: gffDownload.url,
      assemblyAccession,
      indexUrl: gffIndex,
      fastaUrl: fastaDownload.url,
      fastaFaiUrl: BGZipService.getIndexFileUrl(fastaDownload, 'fai'),
      fastaGziUrl: BGZipService.getIndexFileUrl(fastaDownload, 'gzi'),
      attrsToIndex: ['interpro', 'pfam', 'cog', 'kegg', 'go'],
      batchSize: 200,
      onProgress: ({ percent }) => {
        toast.update(`${gffDownload.alias}-index-progress`, {
          progress: percent ? percent / 110 : 0, // extra 10% for roughly the time after batches until the index is complete
          autoClose: 5000,
        });
      },
      onBegin: () => {
        setIsIndexing(true);
        toast.info(`Downloading and indexing ${gffDownload.alias}`, {
          toastId: `${gffDownload.alias}-index-progress`,
          progress: 0.01,
          autoClose: 5000,
        });
      },
      onEnd: ({ contigsCount }) => {
        setIsIndexing(false);
        toast.dismiss(`${gffDownload.alias}-index-progress`);
        toast.success(`Indexed ${contigsCount} assembly contigs`, {
          autoClose: 5000,
        });
        setIsIndexed(true);
      },
      onError: (e) => {
        setIsIndexing(false);
        toast.error(`Error indexing ${gffDownload.alias}: ${e}`, {
          autoClose: false,
        });
      },
    });

  if (gffSize === undefined || !existingIndexChecked || !isViewerReady)
    return <Loading size="small" />;

  if (!isIndexed) {
    return (
      <div
        className="vf-box vf-box-theme--primary vf-box--easy"
        style={{
          backgroundColor: '#d1e3f6',
        }}
      >
        <h3 className="vf-box__heading">
          <span className="icon icon-common icon-common icon-cloud-download-alt" />{' '}
          File download required
        </h3>
        <p className="vf-box__text">
          To search for contigs, a {filesize(gffSize, { round: 0 })} file needs
          to be downloaded to your browser.
          <br />
          {!isIndexing && (
            <button
              className="vf-button vf-button vf-button--primary"
              onClick={async () => {
                await setPageNum(1);
                fetchAndIndex();
              }}
            >
              Download & index GFF
            </button>
          )}
          {isIndexing && (
            <button
              className="vf-button vf-button vf-button--tertiary"
              onClick={cancelFetchAndIndex}
            >
              Cancel
            </button>
          )}
        </p>
      </div>
    );
  }

  // if (isIndexed && contigsTableData === undefined) return (<Loading size="small" />);

  return (
    <>
      <div className="vf-grid vf-grid__col-6">
        <div className="vf-stack vf-stack--400">
          <h4 className="text-heading--4">Search by contained annotations</h4>
          <ContigTypeaheadFilter
            title="InterPro"
            attribute="interpros"
            placeholder="IPR015200"
          />
          <ContigTypeaheadFilter
            title="Pfam"
            attribute="pfams"
            placeholder="PF12574"
          />
          <ContigTypeaheadFilter
            title="COG Category"
            attribute="cogs"
            placeholder="S"
          />
          <ContigTypeaheadFilter
            title="KEGG Ortholog"
            attribute="keggs"
            placeholder="ko:K03325"
          />
          <ContigTypeaheadFilter
            title="Gene Ontology term"
            attribute="gos"
            placeholder="GO:0044281"
          />
        </div>
        <div className="vf-grid__col--span-5">
          <EMGTable
            cols={contigsColumns}
            data={contigsTableData as PaginatedList<Contig>}
            expectedPageSize={PAGESIZE}
            isStale={isStale}
            loading={isStale || !isIndexed}
          />
        </div>
      </div>
      <div
        className="vf-box vf-box-theme--primary vf-box--easy"
        style={{
          backgroundColor: '#d1e3f6',
        }}
      >
        <div className="vf-flag vf-flag--top vf-flag--reversed vf-flag--800">
          <div className="vf-flag__body">
            <p>
              Browsing {contigsTableData.count} annotated contigs from{' '}
              {gffDownload.alias}
            </p>
          </div>
          <div className="vf-flag__media">
            <button
              className="vf-button vf-button vf-button--tertiary vf-button--sm"
              onClick={() =>
                resetDb().then(() => {
                  setIsIndexed(false);
                  setContigsTableData({
                    count: 0,
                    items: [],
                  } as PaginatedList<Contig>);
                  toast.info(`Contig index removed.`, {
                    autoClose: 5000,
                  });
                })
              }
            >
              Remove&nbsp;contig&nbsp;index
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(withQueryParamProvider(ContigSearch));
