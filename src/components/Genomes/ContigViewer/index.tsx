import React, { useMemo } from 'react';
import { find } from 'lodash-es';

import { Download } from '@/interfaces';
import ContigBrowser from 'components/ContigViewer/ContigBrowser';
import AdditionalGffNotice from 'components/ContigViewer/AdditionalGffNotice';
import ContigSearch, {
  ContigSearchFilterConfig,
} from 'components/Analysis/ContigViewer/ContigSearch';
import { LGVProvider } from 'components/Analysis/ContigViewer/V2ContigViewContext';
import Loading from 'components/UI/Loading';

const genomeFilterConfig: ContigSearchFilterConfig[] = [
  {
    title: 'Gene Ontology term',
    attribute: 'gos',
    placeholder: 'GO:0003674',
    gffKey: 'Ontology_term',
    featureDisplay: 'go',
  },
  {
    title: 'COG Category',
    attribute: 'cogs',
    placeholder: 'S',
    gffKey: 'cog',
    featureDisplay: 'cog',
  },
  {
    title: 'dbCAN Protein Type',
    attribute: 'dbcanProtTypes',
    placeholder: 'CAZyme',
    gffKey: 'dbcan_prot_type',
    featureDisplay: 'dbcan',
  },
  {
    title: 'DefenseFinder Activity',
    attribute: 'defenseFinderActivities',
    placeholder: 'restriction',
    gffKey: 'defense_finder_activity',
    featureDisplay: 'defense',
  },
  {
    title: 'Gene',
    attribute: 'genes',
    placeholder: 'tolB',
    gffKey: 'gene',
    featureDisplay: 'gene',
  },
  {
    title: 'InterPro',
    attribute: 'interpros',
    placeholder: 'IPR003593',
    gffKey: 'interpro',
    featureDisplay: 'interpro',
  },
  {
    title: 'KEGG Ortholog',
    attribute: 'keggs',
    placeholder: 'ko:K03088',
    gffKey: 'kegg',
    featureDisplay: 'kegg',
  },
  {
    title: 'Mobile Element Type',
    attribute: 'mobileElementTypes',
    placeholder: 'plasmid',
    gffKey: 'mobile_element_type',
    featureDisplay: 'mobile',
  },
  {
    title: 'Pfam',
    attribute: 'pfams',
    placeholder: 'PF00005',
    gffKey: 'pfam',
    featureDisplay: 'pfam',
  },
  {
    title: 'Rfam',
    attribute: 'rfams',
    placeholder: 'RF00005',
    gffKey: 'rfam',
    featureDisplay: 'rfam',
  },
  {
    title: 'dbCAN PUL Substrate',
    attribute: 'dbcanPulSubstrates',
    placeholder: 'capsule polysaccharide synthesis',
    gffKey: 'substrate_dbcan-pul',
    featureDisplay: 'dbcan-pul',
  },
  {
    title: 'dbCAN Substrate',
    attribute: 'dbcanSubstrates',
    placeholder: 'starch',
    gffKey: 'substrate_dbcan-sub',
    featureDisplay: 'dbcan-sub',
  },
  {
    title: 'ViPhOG Taxonomy',
    attribute: 'viphogTaxonomies',
    placeholder: 'Caudoviricetes',
    gffKey: 'viphog_taxonomy',
    featureDisplay: 'viphog',
  },
  {
    title: 'AMR Drug Class',
    attribute: 'amrDrugClasses',
    placeholder: 'BETA-LACTAM',
    gffKey: 'drug_class',
    featureDisplay: 'amr-drug',
  },
  {
    title: 'AMR Drug Subclass',
    attribute: 'amrDrugSubclasses',
    placeholder: 'CARBAPENEM',
    gffKey: 'drug_subclass',
    featureDisplay: 'amr-subdrug',
  },
  {
    title: 'AMR Element Type',
    attribute: 'amrElementTypes',
    placeholder: 'AMR',
    gffKey: 'element_type',
    featureDisplay: 'amr-element',
  },
  {
    title: 'AMR Element Subtype',
    attribute: 'amrElementSubtypes',
    placeholder: 'AMR',
    gffKey: 'element_subtype',
    featureDisplay: 'amr-subelement',
  },
  {
    title: 'MiBIG Class',
    attribute: 'mibigClasses',
    placeholder: 'Saccharide',
    gffKey: 'nearest_MiBIG_class',
    featureDisplay: 'mibig',
  },
  {
    title: 'antiSMASH Product',
    attribute: 'antismashProducts',
    placeholder: 'terpene',
    gffKey: 'antismash_product',
    featureDisplay: 'antismash',
  },
  {
    title: 'antiSMASH Function',
    attribute: 'antismashFunctions',
    placeholder: 'biosynthetic',
    gffKey: 'antismash_bgc_function',
    featureDisplay: 'antismash-function',
  },
  {
    title: 'GECCO BGC Type',
    attribute: 'geccoBgcTypes',
    placeholder: 'Terpene',
    gffKey: 'gecco_bgc_type',
    featureDisplay: 'gecco',
  },
];

type GenomeContigViewerProps = {
  accession: string;
  downloads: Download[];
};

const downloadName = (download: Download) =>
  download.alias || download.url.split('/').pop() || '';

const isGenomeFna = (download: Download) => {
  const name = downloadName(download).toLowerCase();
  return (
    name.endsWith('.fna') ||
    name.endsWith('.fa') ||
    name.endsWith('.fasta') ||
    download.long_description?.toLowerCase() === 'nucleic acid sequence' ||
    download.short_description?.toLowerCase() === 'nucleic acid sequence'
  );
};

const isGff = (download: Download) =>
  download.file_type === 'gff' ||
  downloadName(download).toLowerCase().endsWith('.gff');

const findGenomeFasta = (downloads: Download[]) =>
  find(downloads, isGenomeFna) ??
  find(downloads, (d) => d.file_type === 'fna') ??
  find(
    downloads,
    (d) => d.file_type === 'fasta' && !downloadName(d).endsWith('.faa')
  );

const findGenomeGff = (downloads: Download[], accession: string) =>
  find(
    downloads,
    (d) =>
      isGff(d) &&
      (d.alias === `${accession}.gff` ||
        d.url.endsWith(`/${accession}.gff`) ||
        (!d.alias?.includes('_virify') && !d.alias?.includes('_sanntis')))
  ) ?? find(downloads, isGff);

const withDownloadAlias = (
  download: Download | undefined
): Download | undefined => {
  if (!download || download.alias) return download;
  return {
    ...download,
    alias: download.url.split('/').pop() || download.file_type,
  };
};

const GenomeContigViewer: React.FC<GenomeContigViewerProps> = ({
  accession,
  downloads,
}) => {
  const fasta = useMemo(
    () => withDownloadAlias(findGenomeFasta(downloads)),
    [downloads]
  );

  const gff = useMemo(
    () => withDownloadAlias(findGenomeGff(downloads, accession)),
    [downloads, accession]
  );

  const additionalGffs = useMemo(() => {
    if (!downloads.length) return [];
    return downloads.filter((d) => isGff(d) && d !== gff);
  }, [downloads, gff]);

  if (!accession) return <Loading size="small" />;
  if (!fasta) return <p>No contigs fasta file available</p>;
  if (!gff) return <p>No annotations available</p>;

  return (
    <LGVProvider fasta={fasta} gff={gff} additionalGffs={additionalGffs}>
      <div className="vf-stack vf-stack--400">
        <ContigBrowser />
        <ContigSearch
          gffDownload={gff}
          fastaDownload={fasta}
          assemblyAccession={accession}
          entityLabel="genome"
          filterConfig={genomeFilterConfig}
          hideUnavailableFilters
        />
        <AdditionalGffNotice additionalGffs={additionalGffs} />
      </div>
    </LGVProvider>
  );
};

export default GenomeContigViewer;
