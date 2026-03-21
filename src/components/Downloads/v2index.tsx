import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { Download } from '@/interfaces';

import './v2style.css';

interface DownloadsProps {
  downloads?: Array<Download>;
}

const fileTypeLabel: Record<string, string> = {
  fasta: 'FASTA',
  tsv: 'TSV',
  gff: 'GFF',
  html: 'HTML',
  json: 'JSON',
  gbk: 'GBK',
  txt: 'TXT',
  xlsx: 'XLSX',
  csv: 'CSV',
};

function getFileFormat(file: Download): string {
  if (file.file_type !== 'other' && fileTypeLabel[file.file_type]) {
    return fileTypeLabel[file.file_type];
  }
  // Detect from filename, stripping .gz
  const name = file.alias.replace(/\.gz$/, '');
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return fileTypeLabel[ext] || ext.toUpperCase() || 'File';
}

const nameOverrides: Record<string, string> = {
  kegg: 'KEGG',
  kegg_modules: 'KEGG Modules',
  go_slims: 'GO Slims',
  go: 'GO',
  antismash: 'antiSMASH',
  dbcan: 'dbCAN',
  virify: 'VIRify',
  eggnog: 'EggNOG',
  interpro: 'InterPro',
  pfams: 'Pfam',
  rhea_reactions: 'Rhea Reactions',
  dram_distill: 'DRAM Distill',
  genome_properties: 'Genome Properties',
  annotation_summary: 'Annotation Summary',
  quality_control: 'Quality Control',
  coding_sequences: 'Coding Sequences',
  taxonomy: 'Taxonomy',
  mobilome_annotation_pipeline: 'Mobilome Annotation Pipeline',
};

function formatGroupLabel(group: string): string {
  const lastPart = group.includes('.') ? group.split('.').pop() : group;
  const key = lastPart || group;
  if (nameOverrides[key]) return nameOverrides[key];
  return key
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

type GroupedDownloads = {
  category: string;
  subgroups: { label: string; files: Download[] }[];
};

const Downloads: React.FC<DownloadsProps> = ({ downloads: propDownloads }) => {
  const { overviewData } = useContext(AnalysisContext);
  const downloads = propDownloads ?? overviewData?.downloads;

  const grouped = useMemo((): GroupedDownloads[] => {
    if (!downloads?.length) return [];
    const categoryOrder: string[] = [];
    const categoryMap: Record<
      string,
      { subgroupOrder: string[]; subgroups: Record<string, Download[]> }
    > = {};

    downloads.forEach((dl) => {
      const cat = dl.download_type;
      const sub = dl.download_group;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { subgroupOrder: [], subgroups: {} };
        categoryOrder.push(cat);
      }
      if (!categoryMap[cat].subgroups[sub]) {
        categoryMap[cat].subgroups[sub] = [];
        categoryMap[cat].subgroupOrder.push(sub);
      }
      categoryMap[cat].subgroups[sub].push(dl);
    });

    return categoryOrder.map((cat) => ({
      category: cat,
      subgroups: categoryMap[cat].subgroupOrder.map((sub) => ({
        label: formatGroupLabel(sub),
        files: categoryMap[cat].subgroups[sub],
      })),
    }));
  }, [downloads]);

  const [showCurlScript, setShowCurlScript] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(feedbackTimeout.current);
  }, []);

  const accession = overviewData?.accession || 'analysis';

  const curlScript = useMemo(() => {
    if (!downloads?.length) return '';
    const lines = downloads.map((dl) => `curl -O "${dl.url}"`);
    return [
      '#!/bin/bash',
      `# Download all files for ${accession}`,
      `mkdir -p ${accession} && cd ${accession}`,
      ...lines,
    ].join('\n');
  }, [downloads, accession]);

  const copyToClipboard = useCallback(
    (text: string, label: string) => {
      clearTimeout(feedbackTimeout.current);
      navigator.clipboard.writeText(text).then(
        () => {
          setCopyFeedback(label);
          feedbackTimeout.current = setTimeout(
            () => setCopyFeedback(null),
            2000
          );
        },
        () => {
          setCopyFeedback('Failed to copy');
          feedbackTimeout.current = setTimeout(
            () => setCopyFeedback(null),
            2000
          );
        }
      );
    },
    []
  );

  const handleCopyUrls = useCallback(() => {
    if (!downloads?.length) return;
    const urls = downloads.map((dl) => dl.url).join('\n');
    copyToClipboard(urls, 'Links copied');
  }, [downloads, copyToClipboard]);

  const handleCopyCurl = useCallback(() => {
    copyToClipboard(curlScript, 'Script copied');
  }, [curlScript, copyToClipboard]);

  if (!downloads?.length) {
    return <p>No downloads available for this analysis.</p>;
  }

  return (
    <div className="vf-stack vf-stack--400">
      <h4>Bulk download</h4>
      <p className="downloads-bulk-description">
        Copy all the file URLs to your clipboard, or generate a ready-to-use{' '}
        <a href="https://en.wikipedia.org/wiki/Curl_(software)" target="_blank" rel="noreferrer" className="vf-link">curl</a>{' '}
        script to download everything from your terminal.
      </p>
      <div className="downloads-bulk-actions">
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={handleCopyUrls}
        >
          <span className="icon icon-common icon-copy" /> Copy download links
        </button>
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={() => setShowCurlScript(!showCurlScript)}
        >
          <span className="icon icon-common icon-tool" />{' '}
          {showCurlScript ? 'Hide' : 'Show'} curl script
        </button>
        <span className="downloads-copy-feedback" role="status" aria-live="polite">
          {copyFeedback}
        </span>
      </div>
      {showCurlScript && (
        <div className="downloads-curl-script">
          <div className="downloads-curl-script__header">
            <span>Bulk download script</span>
            <button
              type="button"
              className="vf-button vf-button--tertiary vf-button--sm"
              onClick={handleCopyCurl}
            >
              Copy
            </button>
          </div>
          <pre className="downloads-curl-script__code">{curlScript}</pre>
        </div>
      )}
      {grouped.map(({ category, subgroups }) => (
        <section key={category}>
          <h4>{category}</h4>
          {subgroups.map(({ label, files }) => {
            const showSubheading = subgroups.length > 1;
            return (
              <div key={label} className="downloads-subgroup">
                {showSubheading && (
                  <h5 className="downloads-subgroup__heading">{label}</h5>
                )}
                <div className="downloads-card-grid">
                  {files.map((file) => {
                    const format = getFileFormat(file);
                    return (
                      <a
                        key={file.url}
                        href={file.url}
                        aria-label={`Download ${file.alias}`}
                        className="vf-card vf-card--brand vf-card--bordered downloads-card"
                      >
                        <div className="downloads-card__content">
                          <div className="downloads-card__badge">
                            <span className="vf-badge vf-badge--secondary vf-badge--pill">
                              {format}
                            </span>
                          </div>
                          <h5 className="downloads-card__heading">
                            {file.short_description}
                          </h5>
                          <p className="downloads-card__description">
                            {file.long_description}
                          </p>
                          <span
                            className="downloads-card__filename"
                            title={file.alias}
                          >
                            {file.alias}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
};

export default Downloads;
