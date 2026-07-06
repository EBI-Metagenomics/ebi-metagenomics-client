import { useContext, useMemo } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import type { Download } from '@/interfaces';

const urlsForAliases = (downloads: Download[], aliases: string[]) =>
  aliases
    .map((alias) => downloads.find((download) => download.alias === alias)?.url)
    .filter(Boolean) as string[];

const useLegacyAnalysisKnownFiles = () => {
  // This hook provides data file URLs for "known" files output by v4.1 and v5 MGnify analysis pipelines.
  // This hook lets the analysis page components show the data files / data visualisations for these files
  // which previously were served from either a database backend or from custom file-readers on the API side.
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const resultsDir = analysisData?.results_dir;
  const pipelineVersion = analysisData?.pipeline_version;

  const isVersion41 = pipelineVersion === 'V4.1';
  const isVersion50 = pipelineVersion === 'V5' || pipelineVersion === '5.0';
  const isSupportedVersion = isVersion41 || isVersion50;

  return useMemo(() => {
    if (!isSupportedVersion) {
      return {
        isSupportedVersion,
        resultsDir,
        pipelineVersion,
      };
    }

    const downloads = analysisData?.downloads || [];
    const qcDownloads = downloads.filter(
      (download) => download.download_group === 'quality_control'
    );
    const qcUrlsForAliases = (aliases: string[]) =>
      urlsForAliases(qcDownloads, aliases);

    const [summaryPath = ''] = qcUrlsForAliases(['qc-statistics/summary.out']);
    const [qcStepPath = ''] = isVersion41
      ? [summaryPath]
      : qcUrlsForAliases(['qc_summary']);

    const [seqLengthPath = '', ...seqLengthFallbacks] = qcUrlsForAliases([
      'qc-statistics/seq-length.out',
      'qc-statistics/seq-length.out.full',
      'qc-statistics/seq-length.out.sub-set',
      'seq-length.out',
      'seq-length.out.full',
      'seq-length.out.sub-set',
    ]);
    const [gcDistributionPath = '', ...gcDistributionFallbacks] =
      qcUrlsForAliases([
        'qc-statistics/GC-distribution.out',
        'qc-statistics/GC-distribution.out.full',
        'qc-statistics/GC-distribution.out.sub-set',
        'GC-distribution.out',
        'GC-distribution.out.full',
        'GC-distribution.out.sub-set',
      ]);
    const [
      nucleotideDistributionPath = '',
      ...nucleotideDistributionFallbacks
    ] = qcUrlsForAliases([
      'qc-statistics/nucleotide-distribution.out',
      'qc-statistics/nucleotide-distribution.out.full',
      'qc-statistics/nucleotide-distribution.out.sub-set',
      'nucleotide-distribution.out',
      'nucleotide-distribution.out.full',
      'nucleotide-distribution.out.sub-set',
    ]);

    const taxonomyPaths = downloads
      .filter((download) =>
        download.download_group.startsWith('taxonomies.closed_reference.')
      )
      .reduce<Record<string, { krona: string; tsv: string; txt: string }>>(
        (paths, download) => {
          const marker = download.download_group.split('.').at(-1);
          if (!marker) return paths;
          if (!paths[marker]) {
            paths[marker] = { krona: '', tsv: '', txt: '' };
          }
          if (download.alias.endsWith('/krona.html')) {
            paths[marker].krona = download.url;
          } else if (download.alias.endsWith('.txt')) {
            paths[marker].txt = download.url;
          } else if (download.alias.endsWith('.tsv')) {
            paths[marker].tsv = download.url;
          }
          return paths;
        },
        {}
      );

    const interproPath =
      downloads.find(
        (download) =>
          download.download_group === 'functional_annotation.interpro'
      )?.url || '';
    const goPath =
      downloads.find(
        (download) =>
          download.download_group === 'functional_annotation.go_slims'
      )?.url || '';

    return {
      isSupportedVersion,
      resultsDir,
      pipelineVersion,
      summaryPath,
      qcStepPath,
      seqLengthPath,
      seqLengthFallbacks,
      gcDistributionPath,
      gcDistributionFallbacks,
      nucleotideDistributionPath,
      nucleotideDistributionFallbacks,
      taxonomyPaths,
      interproPath,
      goPath,
    };
  }, [
    resultsDir,
    isSupportedVersion,
    isVersion41,
    analysisData?.downloads,
    pipelineVersion,
  ]);
};

export default useLegacyAnalysisKnownFiles;
