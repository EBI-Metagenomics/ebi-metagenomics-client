import React from 'react';
import ExtLink from 'components/UI/ExtLink';

type TableProps = {
  onHoverStep?: (step: number) => void;
};
export const Table1: React.FC<TableProps> = ({ onHoverStep = () => null }) => (
  <table className="pipeline_table">
    <thead>
      <tr>
        <th>&nbsp;</th>
        <th>Tools</th>
        <th>Version</th>
        <th>Description</th>
        <th>How we use it</th>
      </tr>
    </thead>
    <tbody>
      <tr
        className="step0 row-cb"
        onMouseOver={() => onHoverStep(0)}
        onFocus={() => onHoverStep(0)}
      >
        <td>1</td>
        <td>
          <ExtLink href="https://github.com/jstjohn/SeqPrep">SeqPrep</ExtLink>
        </td>
        <td>1.1</td>
        <td>
          A program to merge paired end Illumina reads that are overlapping into
          a single longer read.
        </td>
        <td>
          Paired-end overlapping reads are merged - we do not perform assembly.
        </td>
      </tr>

      <tr
        className="step1 row-cb"
        onMouseOver={() => onHoverStep(1)}
        onFocus={() => onHoverStep(1)}
      >
        <td>2.1</td>
        <td>
          <ExtLink href="http://www.usadellab.org/cms/?page=trimmomatic">
            Trimmomatic
          </ExtLink>
        </td>
        <td>0.32</td>
        <td>A flexible read trimming tool.</td>
        <td>
          Low quality trimming (low quality ends and sequences with &gt; 10%
          undetermined nucleotides removed).
        </td>
      </tr>

      <tr
        className="step1 row-cb"
        onMouseOver={() => onHoverStep(1)}
        onFocus={() => onHoverStep(1)}
      >
        <td>2.2</td>
        <td>
          <ExtLink href="http://www.biopython.org/">Biopython</ExtLink>
        </td>
        <td>1.54</td>
        <td>
          A set of freely available tools for biological computation written in
          Python.
        </td>
        <td>Sequences &lt; 100 nucleotides in length removed.</td>
      </tr>

      <tr
        className="step1 row-cb"
        onMouseOver={() => onHoverStep(1)}
        onFocus={() => onHoverStep(1)}
      >
        <td>2.3</td>
        <td>
          <ExtLink href="http://www.drive5.com/uclust/downloads1_1_579.html">
            UCLUST
          </ExtLink>
        </td>
        <td>1.1.579</td>
        <td>A high-performance clustering, alignment and search algorithm.</td>
        <td>
          Duplicate sequences removed - clustered on 99% identity for LS454 or
          on 50 nucleotides prefix identity (using pick_otus.py script in Qiime
          v1.15).
        </td>
      </tr>

      <tr
        className="step1 row-cb"
        onMouseOver={() => onHoverStep(1)}
        onFocus={() => onHoverStep(1)}
      >
        <td>2.4</td>
        <td>
          <ExtLink href="http://www.repeatmasker.org/">RepeatMasker</ExtLink>
        </td>
        <td>3.2.2</td>
        <td>
          A program that screens DNA sequences for interspersed repeats and low
          complexity DNA sequences.
        </td>
        <td>
          Repeat masked - removed reads with 50% or more nucleotides masked.
        </td>
      </tr>

      <tr
        className="step2 row-cb"
        onMouseOver={() => onHoverStep(2)}
        onFocus={() => onHoverStep(2)}
      >
        <td>3</td>
        <td>
          <ExtLink href="http://www.ezbiocloud.net/sw/rrnaselector">
            rRNASelector
          </ExtLink>
        </td>
        <td>1.0.0</td>
        <td>
          A computer program for selecting ribosomal RNA encoding sequences from
          metagenomic and metatranscriptomic shotgun libraries.
        </td>
        <td>
          Prokaryotic rRNA reads are filtered. We use the hidden Markov models
          to identify rRNA sequences.
        </td>
      </tr>

      <tr
        className="step3 row-function"
        onMouseOver={() => onHoverStep(3)}
        onFocus={() => onHoverStep(3)}
      >
        <td>4</td>
        <td>
          <ExtLink href="http://omics.informatics.indiana.edu/FragGeneScan/">
            FragGeneScan
          </ExtLink>
        </td>
        <td>1.15</td>
        <td>An application for finding fragmented genes in short reads.</td>
        <td>
          Reads with predicted coding sequences (pCDS) above 60 nucleotides in
          length.
        </td>
      </tr>

      <tr
        className="step4 row-function"
        onMouseOver={() => onHoverStep(4)}
        onFocus={() => onHoverStep(4)}
      >
        <td>5</td>
        <td>
          <ExtLink href="https://github.com/ebi-pf-team/interproscan/wiki">
            InterProScan
          </ExtLink>
        </td>
        <td>5.0-beta</td>
        <td>
          A sequence analysis application (nucleotide and protein sequences)
          that combines different protein signature recognition methods into one
          resource.
        </td>
        <td>
          Matches are generated against predicted CDS, using a sub set of
          databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from
          InterPro release 31.0. A summary of Gene Ontology (GO) terms derived
          from InterPro matches to your sample is provided. It is generated
          using a reduced list of GO terms called GO slim (version{' '}
          <ExtLink href="https://www.ebi.ac.uk/metagenomics/geneontology/subsets/goslim_metagenomics_may2012.obo">
            goslim_goa 2012
          </ExtLink>
          ).
        </td>
      </tr>

      <tr
        className="step5 row-taxon"
        onMouseOver={() => onHoverStep(5)}
        onFocus={() => onHoverStep(5)}
      >
        <td>6</td>
        <td>
          <ExtLink href="http://qiime.org/">QIIME</ExtLink>
        </td>
        <td>1.5.0</td>
        <td>
          An open-source bioinformatics pipeline for performing taxonomic
          analysis from raw DNA sequencing data.
        </td>
        <td>
          16s rRNA are annotated using the Greengenes reference database
          (default de novo OTU picking protocol with Greengenes 12.10 reference
          with reverse strand matching enabled).
        </td>
      </tr>
    </tbody>
  </table>
);

export const Table2: React.FC = () => <div>PlaceHolder</div>;
