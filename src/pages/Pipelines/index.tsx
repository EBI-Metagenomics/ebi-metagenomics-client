import React from 'react';
import { Link } from 'react-router-dom';

import Pipeline from 'components/Pipeline';
import ExtLink from 'components/UI/ExtLink';
import useURLAccession from 'hooks/useURLAccession';

const Pipelines: React.FC = () => {
  const accession = useURLAccession();
  if (accession.toLowerCase() !== 'pipelines') {
    return <Pipeline version={accession} />;
  }
  return (
    <section className="vf-content">
      <h2>Pipeline release archive</h2>
      <p>
        You will find here the list of pipelines that were used to run the
        analyses.
      </p>

      <h3>
        <span>
          <Link to="/pipelines/5">Pipeline v.5.0</Link>
        </span>{' '}
        (06-Nov-2019)
      </h3>

      <ul>
        <li>
          Major upgrade. This version offers specialised workflows for three
          different data types: amplicon, raw metagenomic/metatranscriptomic
          reads, and assembly. Each workflow is defined in common workflow
          language (CWL) and available in the{' '}
          <ExtLink href="https://github.com/EBI-Metagenomics/pipeline-v5">
            MGnify v5.0 CWL repository
          </ExtLink>
          . Workflows are also available on{' '}
          <ExtLink href="https://workflowhub.eu/projects/9/workflows?filter%5Bworkflow_type%5D=cwl">
            WorkflowHub
          </ExtLink>
          . All databases are available from an{' '}
          <ExtLink href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipeline-5.0/ref-dbs">
            FTP link
          </ExtLink>
          .
        </li>
      </ul>

      <h3>
        <span>
          <Link to="/pipelines/4.1">Pipeline v.4.1</Link>
        </span>{' '}
        (17-Jan-2018)
      </h3>

      <ul>
        <li>
          Upgraded SeqPrep to v1.2 with increased sequence length parameter to
          deal with longer reads
        </li>
        <li>Upgraded MAPseq to v1.2.2</li>
        <li>Rebuilt taxonomic reference database based on SILVA v132</li>
        <li>Taxonomic assignments now also available in HDF5 format</li>
        <li>Applied fix to the coding sequence prediction step</li>
      </ul>

      <h3>
        <span>
          <Link to="/pipelines/4.0">Pipeline v.4.0</Link>
        </span>{' '}
        (04-Sep-2017)
      </h3>

      <ul>
        <li>Updated tools: InterProScan</li>
        <li>
          rRNASelector (used to identify 16S rRNA genes) was replaced with
          Infernal for SSU and LSU gene identification
        </li>
        <li>
          The QIIME taxonomic classification component was replaced with MAPseq
        </li>
        <li>
          The Greengenes reference database was replaced with SILVA SSU / LSU
          version 128, enabling classification of eukaryotes, remapped to a
          8-level taxonomy
        </li>
        <li>
          Prodigal was added to run alongside FragGeneScan as part of a combined
          gene caller when processing assembled sequences
        </li>
      </ul>

      <h3>
        <span>
          <Link to="/pipelines/3.0">Pipeline v.3.0</Link>
        </span>{' '}
        (30-Jun-2016)
      </h3>

      <ul>
        <li>Updated tools: InterProScan, FraGeneScan, QIIME and Trimmomatic</li>
        <li>
          Updated GO slim, based on the analysis of over 22 billion (22x10^9)
          billion functional annotations
        </li>
        <li>Added identification and masking of transfer RNA genes</li>
        <li>
          Improved quality control statistics (sequence length summary, GC and
          nucleotide distribution)
        </li>
      </ul>
      <h3>
        <span>
          <Link to="/pipelines/2.0">Pipeline v.2.0</Link>
        </span>{' '}
        (15-Feb-2015)
      </h3>
      <ul>
        <li>Removed clustering step during the Quality control (QC)</li>
        <li>
          Added step to mask rRNA on reads (instead of removing reads with rRNA)
        </li>
        <li>Improved performance and tools update</li>
      </ul>
      <h3>
        <span>
          <Link to="/pipelines/1.0">Pipeline v.1.0</Link>
        </span>{' '}
        (09-Dec-2009)
      </h3>
    </section>
  );
};

export default Pipelines;
