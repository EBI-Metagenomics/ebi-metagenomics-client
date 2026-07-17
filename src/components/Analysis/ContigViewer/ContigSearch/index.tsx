import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Download, PaginatedList } from '@/interfaces';
import {
  Contig,
  db,
  GffAttributeIndexSpec,
  getGffIndexSpec,
  importGffToIndexedDB,
  PRESENCE_FIELD_BY_ATTRIBUTE,
  resetDb,
  TypeAheadAttributes,
} from 'utils/locallyIndexedGff';
import { useDebounce, useEffectOnce } from 'react-use';
import { toast } from 'react-toastify';
import { BGZipService } from 'components/Analysis/BgZipService';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import SharedQueryParamsProvider, {
  SharedNumberQueryParam,
  SharedQueryParamContext,
  SharedTextQueryParam,
} from 'hooks/queryParamState/QueryParamStore/QueryParamContext';
import { ContigFeatureFlag } from 'components/Analysis/ContigViewer/Table';
import { useLGV } from 'components/Analysis/ContigViewer/V2ContigViewContext';
import ContigTypeaheadFilter from 'components/Analysis/ContigViewer/Filter/ContigFilterTypeahead';
import { Collection } from 'dexie';
import { KEYWORD_ANY } from 'components/UI/TextInputTypeahead';
import { filesize } from 'filesize';
import { camelCase } from 'lodash-es';
import 'components/Analysis/ContigViewer/style.css';

const ALL_ANNOTATIONS_SEARCH_PARAM = 'allAnnotationsSearch';
const SEARCH_ALL_EXAMPLES = ['IPR000771', 'PF00115'];
const SEARCH_GENOMES_EXAMPLES = ['AMR', 'Glutaminase', 'BETA-LACTAM'];

type SearchableContig = Contig & {
  globalSearchMatch?: string;
};

export const findFirstMatchingAnnotationBlock = (
  annotationText: string,
  rawTerm: string
): string | undefined => {
  const term = rawTerm.trim().toLowerCase();
  if (!term) return undefined;

  const matchIndex = (annotationText || '').toLowerCase().indexOf(term);
  if (matchIndex < 0) return undefined;

  const blockStart = annotationText.lastIndexOf(';', matchIndex - 1) + 1;
  const separatorIndex = annotationText.indexOf(';', matchIndex);
  const blockEnd =
    separatorIndex < 0 ? annotationText.length : separatorIndex + 1;
  return annotationText.slice(blockStart, blockEnd).trim();
};

export const findGlobalSearchMatch = (
  contig: Contig,
  rawTerm: string
): string | undefined => {
  const term = rawTerm.trim().toLowerCase();
  if (!term) return undefined;
  if (contig.contigName.toLowerCase().includes(term)) {
    return `Contig ID=${contig.contigName};`;
  }
  return findFirstMatchingAnnotationBlock(contig.annotationText, term);
};

const HighlightedAnnotationMatch: React.FC<{
  text: string;
  searchTerm: string;
}> = ({ text, searchTerm }) => {
  const matchIndex = text
    .toLowerCase()
    .indexOf(searchTerm.trim().toLowerCase());
  if (matchIndex < 0) return <>{text}</>;

  const matchEnd = matchIndex + searchTerm.trim().length;
  return (
    <code>
      {text.slice(0, matchIndex)}
      <mark>{text.slice(matchIndex, matchEnd)}</mark>
      {text.slice(matchEnd)}
    </code>
  );
};

const SearchAllFilter: React.FC<{
  accession: string;
  includeGenomeExamples: boolean;
}> = ({ accession, includeGenomeExamples }) => {
  const [searchTerm, setSearchTerm] = useQueryParamState<string>(
    ALL_ANNOTATIONS_SEARCH_PARAM
  );
  const [value, setValue] = useState(searchTerm || '');
  const examples = includeGenomeExamples
    ? [...SEARCH_ALL_EXAMPLES, ...SEARCH_GENOMES_EXAMPLES, `${accession}_00001`]
    : SEARCH_ALL_EXAMPLES;

  useEffect(() => {
    setValue(searchTerm || '');
  }, [searchTerm]);

  useDebounce(
    () => {
      setSearchTerm(value);
    },
    300,
    [value]
  );

  return (
    <div className="vf-form__item mg-textsearch">
      <label className="vf-form__label" htmlFor="contig-search-all">
        Search all
      </label>
      <input
        id="contig-search-all"
        type="search"
        className="vf-form__input"
        placeholder="Search GFF"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <small className="vf-form__helper mg-contig-search-examples">
        <span>Examples:</span>
        <span className="mg-contig-search-example-links">
          {examples.map((example, index) => (
            <button
              key={example}
              type="button"
              className="vf-button vf-button--link vf-button--sm mg-contig-search-example"
              onClick={() => setValue(example)}
            >
              {example}
              {index < examples.length - 1 ? ',' : ''}
            </button>
          ))}
        </span>
      </small>
    </div>
  );
};

const getFileSize = async (dataFileUrl: string): Promise<number> => {
  let response = await fetch(dataFileUrl, { method: 'HEAD' });
  if (!response.ok || !response.headers.get('content-length')) {
    const controller = new AbortController();
    response = await fetch(dataFileUrl, {
      headers: { Range: 'bytes=0-0' },
      signal: controller.signal,
    });
    if (response.status !== 206) controller.abort();
  }
  const contentRange = response.headers.get('content-range');
  const contentLength = Number(
    contentRange?.split('/')[1] || response.headers.get('content-length') || '0'
  );
  console.debug(`Compressed file size: ${contentLength}`);
  return contentLength;
};

export type ContigSearchFilterConfig = {
  title: string;
  attribute: TypeAheadAttributes;
  placeholder: string;
  gffKey?: string | string[];
  featureDisplay?: string;
  searchParamName?: string;
};

export const getFilterSearchParamName = (
  filter: ContigSearchFilterConfig
): string => filter.searchParamName ?? camelCase(`${filter.title} search`);

const assemblyFilterConfig: ContigSearchFilterConfig[] = [
  {
    title: 'InterPro',
    attribute: 'interpros',
    placeholder: 'IPR015200',
    gffKey: 'interpro',
    featureDisplay: 'interpro',
  },
  {
    title: 'Pfam',
    attribute: 'pfams',
    placeholder: 'PF12574',
    gffKey: 'pfam',
    featureDisplay: 'pfam',
  },
  {
    title: 'COG Category',
    attribute: 'cogs',
    placeholder: 'S',
    gffKey: 'cog',
    featureDisplay: 'cog',
  },
  {
    title: 'KEGG Ortholog',
    attribute: 'keggs',
    placeholder: 'ko:K03325',
    gffKey: 'kegg',
    featureDisplay: 'kegg',
  },
  {
    title: 'Gene Ontology term',
    attribute: 'gos',
    placeholder: 'GO:0044281',
    gffKey: 'Ontology_term',
    featureDisplay: 'go',
  },
];

const ContigSearch: React.FC<{
  gffDownload: Download;
  fastaDownload: Download;
  assemblyAccession: string;
  entityLabel?: string;
  filterConfig?: ContigSearchFilterConfig[];
  hideUnavailableFilters?: boolean;
}> = ({
  gffDownload,
  fastaDownload,
  assemblyAccession,
  entityLabel = 'assembly',
  filterConfig = assemblyFilterConfig,
  hideUnavailableFilters = false,
}) => {
  const [gffSize, setGffSize] = useState<number>();
  const [existingIndexChecked, setExistingIndexChecked] =
    useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [isIndexed, setIsIndexed] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [totalContigsCount, setTotalContigsCount] = useState<number>(0);
  const [availableAttributes, setAvailableAttributes] = useState<
    Set<TypeAheadAttributes> | undefined
  >();
  const { queryParams } = useContext(SharedQueryParamContext);
  const [allAnnotationsSearch] = useQueryParamState<string>(
    ALL_ANNOTATIONS_SEARCH_PARAM
  );
  const searchTermsByAttribute = useMemo<
    Partial<Record<TypeAheadAttributes, string>>
  >(
    () =>
      Object.fromEntries(
        filterConfig.map((filter) => {
          const param = queryParams[getFilterSearchParamName(filter)];
          return [
            filter.attribute,
            (param?.value as string | undefined) ?? param?.defaultValue ?? '',
          ];
        })
      ),
    [filterConfig, queryParams]
  );

  const attrsToIndex = useMemo(
    () =>
      filterConfig.map(
        ({ gffKey, attribute }) =>
          ({
            gffKey: gffKey ?? attribute,
            field: attribute,
          } as GffAttributeIndexSpec)
      ),
    [filterConfig]
  );

  const indexSpec = useMemo(
    () => getGffIndexSpec(attrsToIndex),
    [attrsToIndex]
  );

  const { navTo: navToContig, ready: isViewerReady } = useLGV();

  const visibleFilterConfig = useMemo(() => {
    if (!hideUnavailableFilters || !availableAttributes) return filterConfig;
    return filterConfig.filter(({ attribute }) =>
      availableAttributes.has(attribute)
    );
  }, [availableAttributes, filterConfig, hideUnavailableFilters]);

  const visibleSearchTermsDependency = useMemo(
    () =>
      visibleFilterConfig
        .map(({ attribute }) => searchTermsByAttribute[attribute] ?? '')
        .concat(allAnnotationsSearch || '')
        .join('\u0001'),
    [allAnnotationsSearch, visibleFilterConfig, searchTermsByAttribute]
  );

  useEffect(() => {
    getFileSize(gffDownload.url).then(setGffSize);
  }, [gffDownload]);

  const [contigsTableData, setContigsTableData] = useState<
    PaginatedList<Contig>
  >({
    count: 0,
    items: [],
  } as PaginatedList<Contig>);
  const [pageNum, setPageNum] = useQueryParamState<number>('page');
  const PAGESIZE = 25;

  async function searchContigs(): Promise<PaginatedList<Contig>> {
    setIsStale(true);

    const page = Number(pageNum) || 1;
    const offset = (page - 1) * PAGESIZE;

    const contigsTable = db.contigs;
    let contigsColl: Collection<Contig> | null = null;

    const applyAttrFilter = (
      coll: Collection<Contig> | null,
      idxPath: TypeAheadAttributes,
      rawTerm?: string
    ): Collection<Contig> | null => {
      const term = (rawTerm || '').trim();
      if (!term) return coll;

      if (term === KEYWORD_ANY) {
        const presenceField = PRESENCE_FIELD_BY_ATTRIBUTE[idxPath];
        const base = contigsTable
          .where(`annotationsPresence.${presenceField}`)
          .equals(1);
        return coll
          ? coll.and(
              (c) => (c as any).annotationsPresence?.[presenceField] === 1
            )
          : base;
      }

      const indexName = `annotations.${idxPath}`;
      const termUpper = term.toUpperCase();
      const hasExactMatch = (c: Contig) =>
        ((c.annotations as any)?.[idxPath] as string[] | undefined)?.some(
          (value) => value.toUpperCase() === termUpper
        ) ?? false;
      const base = (contigsTable.where(indexName) as any)
        .startsWithIgnoreCase(term)
        .and(hasExactMatch);
      return coll ? coll.and(hasExactMatch) : base;
    };

    for (const { attribute } of visibleFilterConfig) {
      contigsColl = applyAttrFilter(
        contigsColl,
        attribute,
        searchTermsByAttribute[attribute]
      );
    }

    const globalSearchTerm = (allAnnotationsSearch || '').trim();
    if (globalSearchTerm) {
      const hasGlobalMatch = (contig: Contig) =>
        !!findGlobalSearchMatch(contig, globalSearchTerm);
      contigsColl = contigsColl
        ? contigsColl.and(hasGlobalMatch)
        : contigsTable.filter(hasGlobalMatch);
    }

    contigsColl = contigsColl || contigsTable.toCollection();

    const totalContigs = await contigsColl.count();
    const items = await contigsColl.offset(offset).limit(PAGESIZE).toArray();

    const itemsWithMatches: SearchableContig[] = globalSearchTerm
      ? items.map((contig) => ({
          ...contig,
          globalSearchMatch: findGlobalSearchMatch(contig, globalSearchTerm),
        }))
      : items;

    return { count: totalContigs, items: itemsWithMatches };
  }

  useEffect(() => {
    if (!isIndexed) return;
    searchContigs()
      .then(setContigsTableData)
      .finally(() => setIsStale(false));
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIndexed, pageNum, visibleSearchTermsDependency]);

  useEffect(() => {
    if (!isIndexed) return;
    setPageNum(1);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSearchTermsDependency]);

  useEffect(() => {
    setAvailableAttributes(undefined);
  }, [gffDownload.url, indexSpec]);

  useEffect(() => {
    if (!isIndexed || !hideUnavailableFilters) return;
    let cancelled = false;

    Promise.all(
      filterConfig.map(async ({ attribute }) => {
        const presenceField = PRESENCE_FIELD_BY_ATTRIBUTE[attribute];
        const count = await db.contigs
          .where(`annotationsPresence.${presenceField}`)
          .equals(1)
          .limit(1)
          .count();
        return [attribute, count > 0] as const;
      })
    ).then((availability) => {
      if (cancelled) return;
      setAvailableAttributes(
        new Set(
          availability
            .filter(([, isAvailable]) => isAvailable)
            .map(([attribute]) => attribute)
        )
      );
    });

    return () => {
      cancelled = true;
    };
  }, [filterConfig, hideUnavailableFilters, isIndexed]);

  useEffectOnce(() => {
    if (!isIndexed && !existingIndexChecked) {
      Promise.all([db.meta.get('sourceUrl'), db.meta.get('indexSpec')])
        .then(async ([sourceUrlRow, indexSpecRow]) => {
          if (
            sourceUrlRow?.value &&
            sourceUrlRow.value === gffDownload.url &&
            indexSpecRow?.value === indexSpec
          ) {
            console.debug(
              `File already indexed in local db: ${sourceUrlRow.value}`
            );
            setTotalContigsCount(await db.contigs.count());
            setIsIndexed(true);
            toast.success(`Contigs have been loaded from an earlier visit.`, {
              autoClose: 5000,
            });
          } else {
            await resetDb();
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
          const flags = visibleFilterConfig
            .filter(({ featureDisplay }) => featureDisplay)
            .map(({ attribute, featureDisplay }) => {
              const annotKeyInIndex = PRESENCE_FIELD_BY_ATTRIBUTE[attribute];
              return (
                <ContigFeatureFlag
                  key={annotKeyInIndex}
                  annotationType={featureDisplay as string}
                  present={cell.value?.[annotKeyInIndex] > 0}
                />
              );
            });
          return <div className="emg-contig-feature-flags">{flags}</div>;
        },
      },
      ...((allAnnotationsSearch || '').trim()
        ? [
            {
              Header: 'Search match',
              accessor: (row: SearchableContig) => row.globalSearchMatch,
              id: 'global-search-match',
              isFullWidth: true,
              className: 'break-anywhere',
              Cell: ({ cell }) => (
                <HighlightedAnnotationMatch
                  text={cell.value || ''}
                  searchTerm={allAnnotationsSearch}
                />
              ),
            },
          ]
        : []),
    ],
    [allAnnotationsSearch, visibleFilterConfig, navToContig]
  );

  const gffIndex = BGZipService.getIndexFileUrl(gffDownload);

  const { start: fetchAndIndex, cancel: cancelFetchAndIndex } =
    importGffToIndexedDB({
      url: gffDownload.url,
      assemblyAccession,
      indexUrl: gffIndex,
      fastaUrl: fastaDownload.url,
      fastaFaiUrl: BGZipService.getIndexFileUrl(fastaDownload, 'fai'),
      fastaGziUrl: BGZipService.getIndexFileUrl(fastaDownload, 'gzi'),
      attrsToIndex,
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
        setTotalContigsCount(contigsCount);
        toast.dismiss(`${gffDownload.alias}-index-progress`);
        toast.success(`Indexed ${contigsCount} ${entityLabel} contigs`, {
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

  if (
    gffSize === undefined ||
    !existingIndexChecked ||
    !isViewerReady ||
    (isIndexed && hideUnavailableFilters && !availableAttributes)
  )
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
              View & search contigs
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
      <section className="vf-grid mg-contigs-list">
        <div className="vf-stack vf-stack--800">
          <h4 className="text-heading--4">Search by contained annotations</h4>
          <SearchAllFilter
            accession={assemblyAccession}
            includeGenomeExamples={entityLabel === 'genome'}
          />
          {visibleFilterConfig.length ? (
            visibleFilterConfig.map((filter, index) => (
              <ContigTypeaheadFilter
                key={filter.attribute}
                title={filter.title}
                attribute={filter.attribute}
                placeholder={filter.placeholder}
                searchParamName={getFilterSearchParamName(filter)}
                defaultOpen={index === 0}
              />
            ))
          ) : (
            <p className="vf-text-body vf-text-body--3">
              No searchable annotations were found in this GFF.
            </p>
          )}
        </div>
        <EMGTable
          cols={contigsColumns}
          data={contigsTableData as PaginatedList<Contig>}
          expectedPageSize={PAGESIZE}
          Title={
            <>
              {entityLabel === 'genome' ? 'Genome' : 'Assembly'} Contigs (
              {contigsTableData.count})
            </>
          }
          className="mg-contigs-table"
          isStale={isStale}
          loading={isStale || !isIndexed}
        />
      </section>
      <div
        className="vf-box vf-box-theme--primary vf-box--easy"
        style={{
          backgroundColor: '#d1e3f6',
        }}
      >
        <div className="vf-flag vf-flag--top vf-flag--reversed vf-flag--800">
          <div className="vf-flag__body">
            <p className="vf-text-body vf-text-body--3">
              Browsing {totalContigsCount} annotated contigs from{' '}
              {gffDownload.alias}
            </p>
          </div>
          <div className="vf-flag__media">
            <button
              className="vf-button vf-button vf-button--tertiary vf-button--sm"
              onClick={() =>
                resetDb().then(() => {
                  setIsIndexed(false);
                  setTotalContigsCount(0);
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

const ContigSearchWithQueryParams: React.FC<
  React.ComponentProps<typeof ContigSearch>
> = (props) => {
  const filterConfig = props.filterConfig ?? assemblyFilterConfig;
  const queryParamDefinitions = useMemo(
    () => ({
      page: SharedNumberQueryParam(1),
      pageSize: SharedNumberQueryParam(10),
      order: SharedTextQueryParam(''),
      search: SharedTextQueryParam(''),
      [ALL_ANNOTATIONS_SEARCH_PARAM]: SharedTextQueryParam(''),
      ...Object.fromEntries(
        filterConfig.map((filter) => [
          getFilterSearchParamName(filter),
          SharedTextQueryParam(''),
        ])
      ),
    }),
    [filterConfig]
  );

  return (
    <SharedQueryParamsProvider params={queryParamDefinitions}>
      <ContigSearch {...props} filterConfig={filterConfig} />
    </SharedQueryParamsProvider>
  );
};

export default React.memo(ContigSearchWithQueryParams);
