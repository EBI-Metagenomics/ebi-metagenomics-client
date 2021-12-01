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

export const Table2: React.FC<TableProps> = ({ onHoverStep = () => null }) => (
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
          <ExtLink href="http://biopython.org/wiki/Biopython">
            Biopython
          </ExtLink>
        </td>
        <td>1.65</td>
        <td>
          A set of freely available tools for biological computation written in
          Python.
        </td>
        <td>Sequences &lt; 100 nucleotides in length removed.</td>
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
        <td>1.0.1</td>
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
        <td>5.9-50.0</td>
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
        <td>1.9.0</td>
        <td>
          An open-source bioinformatics pipeline for performing taxonomic
          analysis from raw DNA sequencing data.
        </td>
        <td>
          16s rRNA are annotated using the Greengenes reference database
          (default closed-reference OTU picking protocol with Greengenes 13.8
          reference with reverse strand matching enabled).
        </td>
      </tr>
    </tbody>
  </table>
);

export const Table3: React.FC<TableProps> = ({ onHoverStep = () => null }) => (
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
        <td>0.35</td>
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
          <ExtLink href="http://biopython.org/wiki/Biopython">
            Biopython
          </ExtLink>
        </td>
        <td>1.65</td>
        <td>
          A set of freely available tools for biological computation written in
          Python.
        </td>
        <td>Sequences &lt; 100 nucleotides in length removed.</td>
      </tr>

      <tr
        className="step2 row-cb"
        onMouseOver={() => onHoverStep(2)}
        onFocus={() => onHoverStep(2)}
      >
        <td>3</td>
        <td>
          <ExtLink href="http://hmmer.org">HMMER</ExtLink>
        </td>
        <td>v3.1b1</td>
        <td>
          A computer program for biosequence analysis using profile hidden
          Markov models.
        </td>
        <td>Identification and masking of ncRNAs.</td>
      </tr>

      <tr
        className="step3 row-function"
        onMouseOver={() => onHoverStep(3)}
        onFocus={() => onHoverStep(3)}
      >
        <td>4</td>
        <td>
          <ExtLink href="https://sourceforge.net/projects/fraggenescan/">
            FragGeneScan
          </ExtLink>
        </td>
        <td>1.20</td>
        <td>An application for finding (fragmented) genes in short reads.</td>
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
        <td>5.19-58.0</td>
        <td>
          A sequence analysis application (nucleotide and protein sequences)
          that combines different protein signature recognition methods into one
          resource.
        </td>
        <td>
          Matches are generated against predicted CDS, using a sub set of
          databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from
          InterPro release 58.0. A summary of Gene Ontology (GO) terms derived
          from InterPro matches to your sample is provided. It is generated
          using a reduced list of GO terms called GO slim (version{' '}
          <ExtLink href="http://www.geneontology.org/ontology/subsets/goslim_metagenomics.obo">
            goslim_goa
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
        <td>1.9.1</td>
        <td>
          An open-source bioinformatics pipeline for performing taxonomic
          analysis from raw DNA sequencing data.
        </td>
        <td>
          16s rRNA are annotated using the Greengenes reference database
          (default closed-reference OTU picking protocol with Greengenes 13.8
          reference with reverse strand matching enabled).
        </td>
      </tr>
    </tbody>
  </table>
);
export const Table4: React.FC<TableProps> = ({ onHoverStep = () => null }) => (
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
        <td>0.35</td>
        <td>A flexible read trimming tool.</td>
        <td>
          Low quality trimming (low quality ends and sequences with &gt; 10%
          undetermined nucleotides removed). Adapter sequences removed using
          Biopython SeqIO package.
        </td>
      </tr>

      <tr
        className="step1 row-cb"
        onMouseOver={() => onHoverStep(1)}
        onFocus={() => onHoverStep(1)}
      >
        <td>2.2</td>
        <td>
          <ExtLink href="http://biopython.org/wiki/Biopython">
            Biopython
          </ExtLink>
        </td>
        <td>1.65</td>
        <td>
          A set of freely available tools for biological computation written in
          Python.
        </td>
        <td>Sequences &lt; 100 nucleotides in length removed.</td>
      </tr>

      <tr
        className="step2 row-cb"
        onMouseOver={() => onHoverStep(2)}
        onFocus={() => onHoverStep(2)}
      >
        <td>3.1</td>
        <td>
          <ExtLink href="http://eddylab.org/infernal/">Infernal</ExtLink>
        </td>
        <td>1.1.2</td>
        <td>
          Infernal (&quot;INFERence of RNA ALignment&quot;) is for searching DNA
          sequence databases for RNA structure and sequence similarities. It is
          an implementation of a special case of profile stochastic context-free
          grammars called covariance models (CMs). A CM is like a sequence
          profile, but it scores a combination of sequence consensus and RNA
          secondary structure consensus, so in many cases, it is more capable of
          identifying RNA homologs that conserve their secondary structure more
          than their primary sequence.
        </td>
        <td>Identification of ncRNAs.</td>
      </tr>

      <tr
        className="step2 row-cb"
        onMouseOver={() => onHoverStep(2)}
        onFocus={() => onHoverStep(2)}
      >
        <td>3.2</td>
        <td>
          <ExtLink href="https://raw.githubusercontent.com/nawrockie/cmsearch_tblout_deoverlap/master/cmsearch-deoverlap.pl">
            cmsearch deoverlap script
          </ExtLink>
        </td>
        <td>1.0</td>
        <td>
          A tool, which removes lower scoring overlaps from cmsearch --tblout
          files.
        </td>
        <td>Removes lower scoring overlaps from cmsearch --tblout files.</td>
      </tr>

      <tr
        className="step3 row-function"
        onMouseOver={() => onHoverStep(3)}
        onFocus={() => onHoverStep(3)}
      >
        <td>4.1</td>
        <td>
          <ExtLink href="https://sourceforge.net/projects/fraggenescan/">
            FragGeneScan
          </ExtLink>
        </td>
        <td>1.20</td>
        <td>An application for finding (fragmented) genes in short reads.</td>
        <td>
          Run as a combined gene caller component, giving priority to Prodigal
          predictions in the case of assembled sequences or FragGeneScan for
          short reads (all predictions from the higher priority caller are used,
          supplemented by any non-overlapping regions predicted by the other).
        </td>
      </tr>

      <tr
        className="step3 row-function"
        onMouseOver={() => onHoverStep(3)}
        onFocus={() => onHoverStep(3)}
      >
        <td>4.2</td>
        <td>
          <ExtLink href="https://github.com/hyattpd/prodigal/wiki">
            Prodigal
          </ExtLink>
        </td>
        <td>2.6.3</td>
        <td>
          Prodigal (Prokaryotic Dynamic Programming Genefinding Algorithm) is a
          microbial (bacterial and archaeal) gene finding program.
        </td>
        <td />
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
        <td>5.25-64.0</td>
        <td>
          A sequence analysis application (nucleotide and protein sequences)
          that combines different protein signature recognition methods into one
          resource.
        </td>
        <td>
          Matches are generated against predicted CDS, using a sub set of
          databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from
          InterPro release 64.0. A summary of Gene Ontology (GO) terms derived
          from InterPro matches to your sample is provided. It is generated
          using a reduced list of GO terms called GO slim (version{' '}
          <ExtLink href="http://www.geneontology.org/ontology/subsets/goslim_metagenomics.obo">
            goslim_goa
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
          <ExtLink href="https://github.com/jfmrod/MAPseq/">MAPseq</ExtLink>
        </td>
        <td>1.2</td>
        <td>
          MAPseq is a set of fast and accurate sequence read classification
          tools designed to assign taxonomy and OTU classifications to ribosomal
          RNA sequences.
        </td>
        <td>
          SSU and LSU rRNA are annotated using SILVAs SSU/LSU version 128
          reference database, enabling classification of eukaryotes, remapped to
          a 7-level taxonomy.
        </td>
      </tr>
    </tbody>
  </table>
);

export const Table41: React.FC<TableProps> = ({ onHoverStep = () => null }) => (
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
        <td>1.2</td>
        <td>
          A program to merge paired end Illumina reads that are overlapping into
          a single longer read.
        </td>
        <td>
          Paired-end overlapping reads are merged - if you want your data
          assembled, email us.
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
        <td>0.35</td>
        <td>A flexible read trimming tool.</td>
        <td>
          Low quality trimming (low quality ends and sequences with &gt; 10%
          undetermined nucleotides removed). Adapter sequences removed using
          Biopython SeqIO package.
        </td>
      </tr>

      <tr
        className="step1 row-cb"
        onMouseOver={() => onHoverStep(1)}
        onFocus={() => onHoverStep(1)}
      >
        <td>2.2</td>
        <td>
          <ExtLink href="http://biopython.org/wiki/Biopython">
            Biopython
          </ExtLink>
        </td>
        <td>1.65</td>
        <td>
          A set of freely available tools for biological computation written in
          Python.
        </td>
        <td>Sequences &lt; 100 nucleotides in length removed.</td>
      </tr>

      <tr
        className="step2 row-cb"
        onMouseOver={() => onHoverStep(2)}
        onFocus={() => onHoverStep(2)}
      >
        <td>3.1</td>
        <td>
          <ExtLink href="http://eddylab.org/infernal/">Infernal</ExtLink>
        </td>
        <td>1.1.2</td>
        <td>
          Infernal (&quot;INFERence of RNA ALignment&quot;) is for searching DNA
          sequence databases for RNA structure and sequence similarities. It is
          an implementation of a special case of profile stochastic context-free
          grammars called covariance models (CMs). A CM is like a sequence
          profile, but it scores a combination of sequence consensus and RNA
          secondary structure consensus, so in many cases, it is more capable of
          identifying RNA homologs that conserve their secondary structure more
          than their primary sequence.
        </td>
        <td>Identification of ncRNAs.</td>
      </tr>

      <tr
        className="step2 row-cb"
        onMouseOver={() => onHoverStep(2)}
        onFocus={() => onHoverStep(2)}
      >
        <td>3.2</td>
        <td>
          <ExtLink href="https://github.com/nawrockie/cmsearch_tblout_deoverlap">
            cmsearch deoverlap script
          </ExtLink>
        </td>
        <td>0.01</td>
        <td>
          A tool, which removes lower scoring overlaps from cmsearch --tblout
          files.
        </td>
        <td>Removes lower scoring overlaps from cmsearch --tblout files.</td>
      </tr>

      <tr
        className="step3 row-function"
        onMouseOver={() => onHoverStep(3)}
        onFocus={() => onHoverStep(3)}
      >
        <td>4.1</td>
        <td>
          <ExtLink href="https://sourceforge.net/projects/fraggenescan/">
            FragGeneScan
          </ExtLink>
        </td>
        <td>1.20</td>
        <td>An application for finding (fragmented) genes in short reads.</td>
        <td>
          Run as a combined gene caller component, giving priority to Prodigal
          predictions in the case of assembled sequences or FragGeneScan for
          short reads (all predictions from the higher priority caller are used,
          supplemented by any non-overlapping regions predicted by the other).
        </td>
      </tr>

      <tr
        className="step3 row-function"
        onMouseOver={() => onHoverStep(3)}
        onFocus={() => onHoverStep(3)}
      >
        <td>4.2</td>
        <td>
          <ExtLink href="https://github.com/hyattpd/prodigal/wiki">
            Prodigal
          </ExtLink>
        </td>
        <td>2.6.3</td>
        <td>
          Prodigal (Prokaryotic Dynamic Programming Genefinding Algorithm) is a
          microbial (bacterial and archaeal) gene finding program.
        </td>
        <td />
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
        <td>5.25-64.0</td>
        <td>
          A sequence analysis application (nucleotide and protein sequences)
          that combines different protein signature recognition methods into one
          resource.
        </td>
        <td>
          Matches are generated against predicted CDS, using a sub set of
          databases (Pfam, TIGRFAM, PRINTS, PROSITE patterns, Gene3d) from
          InterPro release 64.0. A summary of Gene Ontology (GO) terms derived
          from InterPro matches to your sample is provided. It is generated
          using a reduced list of GO terms called GO slim (version{' '}
          <ExtLink href="http://www.geneontology.org/ontology/subsets/goslim_metagenomics.obo">
            goslim_goa
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
          <ExtLink href="https://github.com/jfmrod/MAPseq/">MAPseq</ExtLink>
        </td>
        <td>1.2.2</td>
        <td>
          MAPseq is a set of fast and accurate sequence read classification
          tools designed to assign taxonomy and OTU classifications to ribosomal
          RNA sequences.
        </td>
        <td>
          SSU and LSU rRNA are annotated using SILVAs SSU/LSU version 132
          reference database, enabling classification of eukaryotes, remapped to
          a 8-level taxonomy.
        </td>
      </tr>
    </tbody>
  </table>
);
export const Table5: React.FC = () => (
  <table className="stack hover responsive-table">
    <thead>
      <tr>
        <th>Tool/Database</th>
        <th>Version</th>
        <th>Purpose</th>
        <th>Amplicon</th>
        <th>Raw reads</th>
        <th>Assemblies</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <ExtLink href="https://github.com/jstjohn/SeqPrep">SeqPrep</ExtLink>
        </td>
        <td>
          <em>1.2</em>
        </td>
        <td>Merging paired end reads</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="http://www.usadellab.org/cms/?page=trimmomatic">
            Trimmomatic
          </ExtLink>
        </td>
        <td>
          <em>0.36</em>
        </td>
        <td>Quality control</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="http://biopython.org/wiki/Biopython">
            Biopython
          </ExtLink>
        </td>
        <td>
          <em>1.74</em>
        </td>
        <td>Quality control</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/arq5x/bedtools2">bedtools</ExtLink>
        </td>
        <td>
          <em>2.28.0</em>
        </td>
        <td>SSU/LSU rRNA masking for ITS</td>
        <td className="text-center">Yes</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/EddyRivasLab/easel">Easel</ExtLink>
        </td>
        <td>
          <em>0.45h</em>
        </td>
        <td>Sequence extraction</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="http://eddylab.org/infernal/">Infernal</ExtLink>
        </td>
        <td>
          <em>1.1.2</em>
        </td>
        <td>RNA prediction</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://rfam.xfam.org/">Rfam</ExtLink>
        </td>
        <td>
          <em>13.0</em>
        </td>
        <td>Identification of SSU/LSU rRNA and other ncRNA</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/jfmrod/MAPseq/">MAPseq</ExtLink>
        </td>
        <td>
          <em>1.2.3</em>
        </td>
        <td>Taxonomic assignment of SSU/LSU rRNA and ITS</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/marbl/Krona/wiki">
            Kronatools
          </ExtLink>
        </td>
        <td>
          <em>2.7.1</em>
        </td>
        <td>Visualisation of taxonomic analyses</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/biocore/biom-format">
            biom-format
          </ExtLink>
        </td>
        <td>
          <em>2.1.6</em>
        </td>
        <td>Formatting of taxonomic analyses</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://motu-tool.org/">mOTUs2</ExtLink>
        </td>
        <td>
          <em>2.5.1</em>
        </td>
        <td>Phylogenetic marker gene based taxonomic profiling</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/EBI-Metagenomics/FragGeneScan">
            FragGeneScan
          </ExtLink>
        </td>
        <td>
          <em>1.20</em>
        </td>
        <td>Protein coding sequence prediction</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/hyattpd/prodigal/wiki">
            Prodigal
          </ExtLink>
        </td>
        <td>
          <em>2.6.3</em>
        </td>
        <td>Protein coding sequence prediction</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/ebi-pf-team/interproscan/wiki">
            InterProScan
          </ExtLink>
        </td>
        <td>
          <em>75.0</em>
        </td>
        <td>Protein function annotation with separate Pfam results</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/EBI-Metagenomics/pipeline-v5/tree/master/tools/GO-slim">
            GO terms in-house scripts
          </ExtLink>
        </td>
        <td>
          <em>N/A</em>
        </td>
        <td>Assign gene ontology terms</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="http://eggnog5.embl.de">eggNOG</ExtLink>
        </td>
        <td>
          <em>4.5.1</em>
        </td>
        <td>Protein function annotation</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/eggnogdb/eggnog-mapper">
            eggNOG-mapper
          </ExtLink>
        </td>
        <td>
          <em>1.0.3</em>
        </td>
        <td>Protein function annotation</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/EddyRivasLab/hmmer">HMMER</ExtLink>
        </td>
        <td>
          <em>3.2.1</em>
        </td>
        <td>KEGG Ortholog prediction</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="ftp://ftp.ebi.ac.uk/pub/databases/metagenomics/kegg_dbs/">
            KOfam - a modified version based on KEGG 90.0
          </ExtLink>
        </td>
        <td>
          <em>2019-04-06</em>
        </td>
        <td>KEGG Ortholog prediction</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/EBI-Metagenomics/pipeline-v5/tree/master/tools/Assembly/KEGG_analysis">
            KEGG and in-house scripts
          </ExtLink>
        </td>
        <td>
          <em>90.0</em>
        </td>
        <td>KEGG pathway predictions</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/ebi-pf-team/genome-properties">
            Genome Properties
          </ExtLink>
        </td>
        <td>
          <em>2.0.1</em>
        </td>
        <td>Systems and pathways annotation</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/antismash/antismash">
            antiSMASH
          </ExtLink>
        </td>
        <td>
          <em>4.2.0</em>
        </td>
        <td>Secondary metabolite biosynthetic gene cluster annotation</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://www.wsi.uni-tuebingen.de/lehrstuehle/algorithms-in-bioinformatics/software/diamond/">
            DIAMOND
          </ExtLink>
        </td>
        <td>
          <em>0.9.25.126</em>
        </td>
        <td>Protein sequence-based taxonomic analysis</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://www.arb-silva.de/download/archive/">
            SILVA release
          </ExtLink>
        </td>
        <td>
          <em>132</em>
        </td>
        <td>SSU/LSU rRNA taxonomic database</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="http://itsonedb.cloud.ba.infn.it/">ITSoneDB</ExtLink>
        </td>
        <td>
          <em>1.138</em>
        </td>
        <td>ITS1 taxonomic database</td>
        <td className="text-center">Yes</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://unite.ut.ee/">UNITE</ExtLink>
        </td>
        <td>
          <em>8.0</em>
        </td>
        <td>ITS taxonomic database</td>
        <td className="text-center">Yes</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://www.uniprot.org/uniref/">UniRef90</ExtLink>
        </td>
        <td>
          <em>2019_11</em>
        </td>
        <td>Protein sequence-based taxonomic analysis</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td className="text-center">Yes</td>
      </tr>
      <tr>
        <td>
          <ExtLink href="https://github.com/ablab/spades">metaSPAdes</ExtLink>
        </td>
        <td>
          <em>3.13</em>
        </td>
        <td>Assembly of raw reads (available on request)</td>
        <td className="text-center">N/A</td>
        <td className="text-center">N/A</td>
        <td className="text-center">N/A</td>
      </tr>
    </tbody>
  </table>
);
