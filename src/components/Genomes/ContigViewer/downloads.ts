import { find } from 'lodash-es';
import type { Download } from '@/interfaces';

const downloadName = (download: Download) =>
  (download.alias || download.url.split('/').pop() || '').replace(/\.gz$/i, '');

const isNonReferenceFasta = (download: Download) => {
  const name = downloadName(download).toLowerCase();
  return (
    name.endsWith('.faa') ||
    name.includes('rrna') ||
    download.download_group === 'Pan-Genome analysis' ||
    download.url.includes('/pan-genome/')
  );
};

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

export const isGff = (download: Download) =>
  download.file_type === 'gff' ||
  downloadName(download).toLowerCase().endsWith('.gff');

export const findGenomeFasta = (downloads: Download[], accession: string) => {
  const candidates = downloads.filter((d) => !isNonReferenceFasta(d));
  return (
    find(candidates, (d) =>
      ['fna', 'fa', 'fasta'].some(
        (extension) => downloadName(d) === `${accession}.${extension}`
      )
    ) ??
    find(
      candidates,
      (d) => d.file_type === 'fasta' && d.download_group === 'quality_control'
    ) ??
    find(candidates, isGenomeFna) ??
    find(candidates, (d) => d.file_type === 'fna' || d.file_type === 'fasta')
  );
};

export const findGenomeGff = (downloads: Download[], accession: string) =>
  find(downloads, (d) => isGff(d) && downloadName(d) === `${accession}.gff`) ??
  find(
    downloads,
    (d) => isGff(d) && d.download_group === 'annotation_summary'
  ) ??
  find(
    downloads,
    (d) =>
      isGff(d) &&
      !downloadName(d).includes('_virify') &&
      !downloadName(d).includes('_sanntis')
  ) ??
  find(downloads, isGff);
