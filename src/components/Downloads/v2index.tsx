import React, { useContext, useMemo, useState } from 'react';
import { groupBy, last, map, startCase } from 'lodash-es';
import { toast } from 'react-toastify';
import { Download } from '@/interfaces';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

interface DownloadsProps {
  downloads?: Array<Download>;
}

function getFileFormat(file: Download): string {
  if (file.file_type && file.file_type !== 'other') {
    return file.file_type.toUpperCase();
  }
  return (
    last(file.alias.replace(/\.gz$/, '').split('.'))?.toUpperCase() || 'File'
  );
}

// TODO: move to a shared string store (also useful in contig browser feature panel)
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
  return startCase(key);
}

type GroupedDownloads = {
  category: string;
  subgroups: { label: string; files: Download[] }[];
};

const sayCopied = (message: string) =>
  toast.success(message, {
    position: 'bottom-left',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

const Downloads: React.FC<DownloadsProps> = ({ downloads: propDownloads }) => {
  const { overviewData } = useContext(AnalysisContext);
  const downloads = propDownloads ?? overviewData?.downloads;

  const grouped = useMemo((): GroupedDownloads[] => {
    if (!downloads?.length) return [];
    const byCategory = groupBy(downloads, 'download_type');
    return map(byCategory, (catFiles, category) => {
      const bySubgroup = groupBy(catFiles, 'download_group');
      return {
        category,
        subgroups: map(bySubgroup, (files, sub) => ({
          label: formatGroupLabel(sub),
          files,
        })),
      };
    });
  }, [downloads]);

  const [showCurlScript, setShowCurlScript] = useState(false);

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

  if (!downloads?.length) {
    return <p>No downloads available for this analysis.</p>;
  }

  return (
    <div className="vf-stack vf-stack--400">
      <h4>Bulk download</h4>
      <p>
        Copy all the file URLs to your clipboard, or generate a ready-to-use{' '}
        <a
          href="https://en.wikipedia.org/wiki/Curl_(software)"
          target="_blank"
          rel="noreferrer"
          className="vf-link"
        >
          curl
        </a>{' '}
        script to download everything from your terminal.
      </p>
      <div>
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={() => {
            const urls = downloads.map((dl) => dl.url).join('\n');
            navigator.clipboard.writeText(urls);
            sayCopied('Copied download links to clipboard!');
          }}
        >
          <span className="icon icon-common icon-copy" /> Copy download links
        </button>
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={() => {
            navigator.clipboard.writeText(curlScript);
            sayCopied('Copied curl script to clipboard!');
          }}
        >
          <span className="icon icon-common icon-copy" /> Copy curl script
        </button>
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={() => setShowCurlScript(!showCurlScript)}
        >
          <span className="icon icon-common icon-tool" />{' '}
          {showCurlScript ? 'Hide' : 'Show'} curl script
        </button>
      </div>
      {showCurlScript && (
        <div className="vf-code-example">
          <pre className="vf-code-example__pre">{curlScript}</pre>
          <button
            type="button"
            className="vf-button vf-button--tertiary vf-button--sm"
            onClick={() => {
              navigator.clipboard.writeText(curlScript);
              sayCopied('Copied curl script to clipboard!');
            }}
          >
            Copy
          </button>
        </div>
      )}
      {grouped.map(({ category, subgroups }) => (
        <section key={category}>
          <h4>{category}</h4>
          {subgroups.map(({ label, files }) => {
            const showSubheading = subgroups.length > 1;
            return (
              <div key={label} className="vf-stack vf-stack--200">
                {showSubheading && (
                  <h4 className="vf-u-margin__top--400">{label}</h4>
                )}
                <div className="vf-grid vf-grid__col-3">
                  {files.map((file) => {
                    const format = getFileFormat(file);
                    return (
                      <a
                        key={file.url}
                        href={file.url}
                        aria-label={`Download ${file.alias}`}
                        className="vf-card vf-card--brand vf-card--bordered"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="vf-card__content">
                          <div className="vf-flag vf-flag--top vf-flag--200">
                            <div className="vf-flag__body">
                              <h5 className="vf-card__heading">
                                {file.short_description}
                              </h5>
                            </div>
                            <div className="vf-flag__media">
                              <span className="vf-badge vf-badge--secondary vf-badge--pill">
                                {format}
                              </span>
                            </div>
                          </div>
                          <p className="vf-card__text">
                            {file.long_description}
                          </p>
                          <span
                            className="vf-card__text vf-text-body--5"
                            title={file.alias}
                          >
                            <code>{file.alias}</code>
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
