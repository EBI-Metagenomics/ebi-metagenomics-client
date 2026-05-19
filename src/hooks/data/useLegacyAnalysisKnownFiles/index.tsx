import { useContext, useMemo } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const useLegacyAnalysisKnownFiles = () => {
  // This hook provides data file paths for "known" files output by v4.1 and v5 MGnify analysis pipelines.
  // This is mostly for files that aren't (always) present in the downloads lists of the analyses from APIv2.
  // This hook lets the analysis page components show the data files / data visualisations for these files
  // which previously were served from either a database backend or from custom file-readers on the API side.
  // TODO: ideally every case would be covered by an entry in the analysis object's downloads list.
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const resultsDir = analysisData?.results_dir;
  const pipelineVersion = analysisData?.pipeline_version;
  const experimentType = analysisData?.experiment_type;

  const isVersion41 = pipelineVersion === 'V4.1';
  const isVersion50 = pipelineVersion === 'V5' || pipelineVersion === '5.0';
  const isSupportedVersion = isVersion41 || isVersion50;

  const isAssembly = experimentType?.toLowerCase().endsWith('assembly');

  return useMemo(() => {
    if (!resultsDir || !isSupportedVersion) {
      return {
        isSupportedVersion,
        resultsDir,
        pipelineVersion,
      };
    }

    const summaryPath = `${resultsDir}/qc-statistics/summary.out`;
    const qcStepPath = isVersion41
      ? `${resultsDir}/qc-statistics/summary.out`
      : `${resultsDir}/qc_summary`;

    const seqLengthPath = `${resultsDir}/qc-statistics/seq-length.out`;
    const seqLengthFallbacks = [
      `${resultsDir}/qc-statistics/seq-length.out.full`,
      `${resultsDir}/qc-statistics/seq-length.out.sub-set`,
      `${resultsDir}/seq-length.out`,
      `${resultsDir}/seq-length.out.full`,
      `${resultsDir}/seq-length.out.sub-set`,
    ];
    const gcDistributionPath = `${resultsDir}/qc-statistics/GC-distribution.out`;
    const gcDistributionFallbacks = [
      `${resultsDir}/qc-statistics/GC-distribution.out.full`,
      `${resultsDir}/qc-statistics/GC-distribution.out.sub-set`,
      `${resultsDir}/GC-distribution.out`,
      `${resultsDir}/GC-distribution.out.full`,
      `${resultsDir}/GC-distribution.out.sub-set`,
    ];
    const nucleotideDistributionPath = `${resultsDir}/qc-statistics/nucleotide-distribution.out`;
    const nucleotideDistributionFallbacks = [
      `${resultsDir}/qc-statistics/nucleotide-distribution.out.full`,
      `${resultsDir}/qc-statistics/nucleotide-distribution.out.sub-set`,
      `${resultsDir}/nucleotide-distribution.out`,
      `${resultsDir}/nucleotide-distribution.out.full`,
      `${resultsDir}/nucleotide-distribution.out.sub-set`,
    ];

    const taxonomyPaths: Record<
      string,
      { krona: string; tsv: string; txt: string }
    > = {};
    const detectedMarkers = new Set<string>();

    (analysisData?.downloads || []).forEach((download) => {
      if (
        download.download_group === 'taxonomic_analysis' ||
        download.download_type === 'Taxonomic analysis'
      ) {
        // Example alias: "SSU rRNA KRONA plot" or "SSU rRNA taxonomic classification"
        const alias = download.alias.toLowerCase();
        let marker = '';
        if (alias.includes('ssu')) marker = 'ssu';
        else if (alias.includes('lsu')) marker = 'lsu';
        else if (alias.includes('itsonedb')) marker = 'itsonedb';
        else if (alias.includes('unite')) marker = 'unite';

        if (marker) {
          detectedMarkers.add(marker);
          if (!taxonomyPaths[marker]) {
            taxonomyPaths[marker] = {
              krona: `${resultsDir}/taxonomy-summary/${marker.toUpperCase()}/krona.html`,
              tsv: '',
              txt: '',
            };
          }
          if (download.file_type === 'html' && alias.includes('krona')) {
            taxonomyPaths[marker].krona = download.url;
          } else if (
            download.file_type === 'tsv' &&
            !download.url.endsWith('.gz')
          ) {
            taxonomyPaths[marker].tsv = download.url;
          } else if (
            download.file_type === 'txt' &&
            !download.url.endsWith('.gz')
          ) {
            taxonomyPaths[marker].txt = download.url;
          } else if (
            download.file_type === 'biom' &&
            !taxonomyPaths[marker].tsv
          ) {
            // Some analyses might have .biom but we need the .tsv for the table.
            // We can predict the .tsv path from the .biom path usually.
            taxonomyPaths[marker].tsv = download.url.replace('.biom', '.tsv');
          }
        }
      }
    });

    // Fallback: If no markers were detected via downloads, but it's a supported version,
    // we assume SSU and LSU might exist in the standard locations.
    if (detectedMarkers.size === 0 && isSupportedVersion) {
      ['ssu', 'lsu'].forEach((marker) => {
        taxonomyPaths[marker] = {
          krona: `${resultsDir}/taxonomy-summary/${marker.toUpperCase()}/krona.html`,
          tsv: `${resultsDir}/taxonomy-summary/${marker.toUpperCase()}/${
            analysisData.accession
          }_${marker.toUpperCase()}.fasta.mseq.tsv`,
          txt: `${resultsDir}/taxonomy-summary/${marker.toUpperCase()}/${
            analysisData.accession
          }_${marker.toUpperCase()}.fasta.mseq.txt`,
        };
      });
    }

    const functionalAccession = analysisData.assembly?.accession;
    const functionalFilename =
      isAssembly && functionalAccession
        ? `${functionalAccession}_FASTA`
        : functionalAccession;

    const interproPath =
      isVersion41 && functionalFilename
        ? `${resultsDir}/${functionalFilename}_summary.ipr`
        : '';
    const goPath =
      isVersion41 && functionalFilename
        ? `${resultsDir}/${functionalFilename}_summary.go`
        : '';

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
    analysisData?.assembly?.accession,
    analysisData?.accession,
    isAssembly,
    pipelineVersion,
  ]);
};

export default useLegacyAnalysisKnownFiles;
