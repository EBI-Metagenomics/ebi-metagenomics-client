import React, { useContext, useEffect, useState } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { BGZipService } from 'components/Analysis/BgZipService';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import Loading from 'components/UI/Loading';

const DRAM: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const report = overviewData?.downloads.find(
    (file) =>
      file.download_group === 'pathways_and_systems.dram_distill' &&
      file.alias.endsWith('.html.gz')
  );
  const [html, setHtml] = useState<string | null>();

  useEffect(() => {
    let cancelled = false;
    setHtml(undefined);
    if (!report) return;

    new BGZipService(report, false)
      .readGzipFileAsText()
      .then((value) => {
        if (!cancelled) setHtml(value);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [report]);

  if (!report) return <p>No DRAM report available</p>;

  return (
    <div className="vf-stack">
      <p className="text-sm text-gray-600 mb-4">
        DRAM (Distilling and Refining Annotations of Metabolism) organises gene
        annotations into ecosystem-relevant functional categories, yielding
        microbial metabolism summaries that can be compared across ecosystems.
      </p>
      <DetailedVisualisationCard
        ftpLink={report.url}
        title={report.short_description}
        subheading={report.long_description}
      >
        {html === undefined && <Loading />}
        {html === null && <p>Unable to display DRAM report</p>}
        {html && (
          <iframe
            title={report.short_description}
            className="multiqc-iframe"
            sandbox="allow-scripts"
            srcDoc={html}
          />
        )}
      </DetailedVisualisationCard>
    </div>
  );
};

export default DRAM;
