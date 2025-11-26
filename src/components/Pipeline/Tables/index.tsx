import React from 'react';
import ExtLink from 'components/UI/ExtLink';
import RouteForHash from 'components/Nav/RouteForHash';

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
          <em>3.15</em>
        </td>
        <td>Assembly of raw reads (available on request)</td>
        <td className="text-center">N/A</td>
        <td className="text-center">N/A</td>
        <td className="text-center">N/A</td>
      </tr>
    </tbody>
  </table>
);

const Table6Raw: React.FC = () => (
  <>
    <table className="stack hover responsive-table">
      <thead>
        <tr>
          <th>Tool</th>
          <th>Version</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="https://github.com/BioInfoTools/BBMap">bbmap</a>
          </td>
          <td>35.85</td>
          <td>Standardise paired-end fastq files</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/OpenGene/fastp">fastp</a>
          </td>
          <td>0.24.0</td>
          <td>Quality control reads, and merging paired-end reads</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/lh3/seqtk">seqtk</a>
          </td>
          <td>1.3-r106</td>
          <td>Coverting fastq to fasta</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/shenwei356/seqkit">seqkit</a>
          </td>
          <td>2.9.0</td>
          <td>
            Translating nucleotide to amino acid sequences, and randomly
            subsampling sequence files
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/bwa-mem2/bwa-mem2">bwa-mem2</a>
          </td>
          <td>2.2.1</td>
          <td>Map short reads to decontamination reference genomes</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/lh3/minimap2">minimap2</a>
          </td>
          <td>2.3.0</td>
          <td>Map long reads to decontamination reference genomes</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/samtools/samtools">samtools</a>
          </td>
          <td>1.21</td>
          <td>
            Filter fasta/fastq files for decontamination, and generate summary
            statistics
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EddyRivasLab/infernal">infernal</a>
          </td>
          <td>1.1.5</td>
          <td>
            Mapping reads to rRNA covariance models using <code>cmsearch</code>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EddyRivasLab/easel">easel</a>
          </td>
          <td>0.49</td>
          <td>Extracting sequences from cmsearch mapping</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/jfmrod/MAPseq">mapseq</a>
          </td>
          <td>2.1.1b</td>
          <td>Mapping rRNA reads to a reference database</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/marbl/Krona">Krona</a>
          </td>
          <td>2.8.1</td>
          <td>Generate interactive taxonomic profiles</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/motu-tool/mOTUs">mOTUs</a>
          </td>
          <td>3.0.3</td>
          <td>Generate taxonomic profile</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EddyRivasLab/hmmer">HMMer</a>
          </td>
          <td>3.4</td>
          <td>
            Map reads to hidden markov models (HMMs) (i.e. Pfam-A) using{' '}
            <code>hmmsearch</code>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/MultiQC/MultiQC">MultiQC</a>
          </td>
          <td>1.27</td>
          <td>
            Generating reports containing QC and decontamination information
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://www.nextflow.io/">Nextflow</a>
          </td>
          <td>24.10.2</td>
          <td>Running the pipeline</td>
        </tr>
        <tr>
          <td>
            <a href="https://www.python.org/">Python</a>
          </td>
          <td>3.11.8</td>
          <td>Generating functional profiles</td>
        </tr>
      </tbody>
    </table>
    <h4>Accessory scripts</h4>
    <table className="stack hover responsive-table">
      <thead>
        <tr>
          <th>Tool</th>
          <th>Version</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="https://github.com/nawrockie/cmsearch_tblout_deoverlap">
              cmsearch_tblout_deoverlap
            </a>
          </td>
          <td>v0.09</td>
          <td>
            Resolve reads mapping to multiple locations of rRNA covariance model
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EBI-Metagenomics/mgnify-pipelines-toolkit">
              mgnify-pipelines-toolkit
            </a>
          </td>
          <td>1.0.4</td>
          <td>
            Contains <code>mapseq2biom</code> for converting mapseq output to a
            BIOM taxonomic profiles, and provides known environment for
            executing various other commands
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Reference databases</h4>
    <table className="stack hover responsive-table">
      <thead>
        <tr>
          <th>Database</th>
          <th>Version</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="https://motu-tool.org/">mOTUs</a>
          </td>
          <td>3.0.3</td>
          <td>Database for mOTUs tools</td>
        </tr>
        <tr>
          <td>
            <a href="https://rfam.org/">Rfam</a>
          </td>
          <td>15.0</td>
          <td>Ribosomal covariance models</td>
        </tr>
        <tr>
          <td>
            <a href="https://www.ebi.ac.uk/interpro/entry/pfam">Pfam</a>
          </td>
          <td>38.0</td>
          <td>Protein hidden markov models (HMMs)</td>
        </tr>
        <tr>
          <td>
            <a href="https://www.arb-silva.de/">SILVA</a>
          </td>
          <td>138.1</td>
          <td>LSU and SSU 16S database with taxonomy</td>
        </tr>
        <tr>
          <td>
            <a href="https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000001405.40/">
              hg38
            </a>
          </td>
          <td>GRCh38.p14</td>
          <td>Human host reference genome for decontaminations</td>
        </tr>
        <tr>
          <td>
            <a href="https://www.ncbi.nlm.nih.gov/nuccore/9626372">phiX</a>
          </td>
          <td>phiX174</td>
          <td>
            DNA sometimes introduced by Illumina sequencing platforms to be
            removed in decontamination
          </td>
        </tr>
      </tbody>
    </table>
  </>
);

const Table6Amplicon: React.FC = () => (
  <>
    <table className="stack hover responsive-table">
      <thead>
        <tr>
          <th>Tool</th>
          <th>Version</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="https://github.com/OpenGene/fastp">fastp</a>
          </td>
          <td>0.23.4</td>
          <td>Read quality control</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/telatin/seqfu2">SeqFu</a>
          </td>
          <td>1.20.3</td>
          <td>FASTQ sanity checking</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/lh3/seqtk">seqtk</a>
          </td>
          <td>1.3-r106</td>
          <td>FASTQ file manipulation</td>
        </tr>
        <tr>
          <td>
            <a href="https://bioinf.shenwei.me/seqkit/">SeqKit</a>
          </td>
          <td>2.9.0</td>
          <td>FASTQ file manipulation</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EddyRivasLab/easel">easel</a>
          </td>
          <td>0.49</td>
          <td>FASTA file manipulation</td>
        </tr>
        <tr>
          <td>
            <a href="https://bedtools.readthedocs.io/en/latest/">bedtools</a>
          </td>
          <td>2.30.0</td>
          <td>FASTA sequence masking</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EddyRivasLab/infernal/tree/master">
              Infernal/cmsearch
            </a>
          </td>
          <td>1.1.5</td>
          <td>rRNA sequence searching</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/nawrockie/cmsearch_tblout_deoverlap/tree/master">
              cmsearch_tblout_deoverlap
            </a>
          </td>
          <td>0.09</td>
          <td>Deoverlapping of cmsearch results</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/meringlab/MAPseq">MAPseq</a>
          </td>
          <td>2.1.1b</td>
          <td>Reference-based taxonomic classification of rRNA</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/marbl/Krona">Krona</a>
          </td>
          <td>2.8.1</td>
          <td>Krona chart visualisation</td>
        </tr>
        <tr>
          <td>
            <a href="https://cutadapt.readthedocs.io/en/stable/">cutadapt</a>
          </td>
          <td>4.6</td>
          <td>Primer trimming</td>
        </tr>
        <tr>
          <td>
            <a href="https://www.r-project.org/">R</a>
          </td>
          <td>4.3.3</td>
          <td>R programming language (runs DADA2)</td>
        </tr>
        <tr>
          <td>
            <a href="https://benjjneb.github.io/dada2/index.html">DADA2</a>
          </td>
          <td>1.30.0</td>
          <td>ASV calling</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/MultiQC/MultiQC">MultiQC</a>
          </td>
          <td>1.24.1</td>
          <td>Result aggregation into HTML reports</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EBI-Metagenomics/mgnify-pipelines-toolkit">
              mgnify-pipelines-toolkit
            </a>
          </td>
          <td>0.1.8</td>
          <td>Toolkit containing various in-house processing scripts</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EBI-Metagenomics/PIMENTO">PIMENTO</a>
          </td>
          <td>1.0.0</td>
          <td>Primer inference toolkit used in the pipeline</td>
        </tr>
      </tbody>
    </table>

    <table className="stack hover responsive-table">
      <thead>
        <tr>
          <th>Reference database</th>
          <th>Version</th>
          <th>Purpose</th>
          <th>Processed file paths</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="https://www.arb-silva.de/">SILVA</a>
          </td>
          <td>138.1</td>
          <td>16S+18S+LSU rRNA database</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/silva-ssu/">
              silva-ssu
            </a>
            ,
            <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/silva-lsu/">
              silva-lsu
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://pr2-database.org/">PR2</a>
          </td>
          <td>5.0</td>
          <td>Protist-focused 18S+16S rRNA database</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/pr2/">
              pr2
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://unite.ut.ee/">UNITE</a>
          </td>
          <td>9.0</td>
          <td>ITS database</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/unite/">
              unite
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://itsonedb.cloud.ba.infn.it">ITSoneDB</a>
          </td>
          <td>1.141</td>
          <td>ITS database</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/itsonedb/">
              itsonedb
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://rfam.org/">Rfam</a>
          </td>
          <td>14.10</td>
          <td>rRNA covariance models</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/rfam/">
              rfam
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <blockquote>
      <strong>Note:</strong> The preprocessed databases are generated with the{' '}
      <a href="https://github.com/EBI-Metagenomics/reference-databases-preprocessing-pipeline">
        Microbiome Informatics reference-databases-preprocessing-pipeline
      </a>
      .
    </blockquote>
  </>
);

const Table6Assembly: React.FC = () => (
  <>
    <table className="stack hover responsive-table">
      <thead>
        <tr>
          <th>Tool</th>
          <th>Version</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="https://antismash.secondarymetabolites.org/#!/start">
              antiSMASH
            </a>
          </td>
          <td>8.0.1</td>
          <td>
            Tool for the identification and annotation of secondary metabolite
            biosynthesis gene clusters
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/boto/boto3">boto3</a>
          </td>
          <td>1.35.37</td>
          <td>
            AWS SDK for Python used to access EBI FIRE S3 storage for assembly
            file downloads
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/MGXlab/CAT_pack">CAT_pack</a>
          </td>
          <td>6.0</td>
          <td>Taxonomic classification of the contigs in the assembly</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/nawrockie/cmsearch_tblout_deoverlap/">
              cmsearchtbloutdeoverlap
            </a>
          </td>
          <td>0.09</td>
          <td>Deoverlapping of cmsearch results</td>
        </tr>
        <tr>
          <td>
            <a href="http://bioinf.shenwei.me/csvtk">csvtk</a>
          </td>
          <td>0.31.0</td>
          <td>A cross-platform, efficient, and practical CSV/TSV toolkit</td>
        </tr>
        <tr>
          <td>
            <a href="https://www.ebi.ac.uk/metagenomics">
              Combined Gene Caller - Merge
            </a>
          </td>
          <td>1.2.0</td>
          <td>
            Combined gene caller merge script used to combine predictions of
            Pyrodigal and FragGeneScanRS (this tool is part of the
            mgnify-pipelines-toolkit)
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/bbuchfink/diamond">Diamond</a>
          </td>
          <td>2.1.11</td>
          <td>
            Used to match predicted CDS against the CAT reference database for
            the taxonomic classification of the contigs
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/WrightonLabCSU/DRAM">DRAM</a>
          </td>
          <td>13.5</td>
          <td>
            Summarizes annotations from multiple tools like KEGG, Pfam, and CAZy
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EddyRivasLab/easel">easel</a>
          </td>
          <td>0.49</td>
          <td>
            Extracts FASTA sequences by name from a cmsearch deoverlap result
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EBI-Metagenomics/mgnify-pipelines-toolkit">
              extractcoords
            </a>
          </td>
          <td>1.2.0</td>
          <td>
            Processes output from easel-sfetch to extract SSU and LSU sequences
            (this tool is part of the mgnify-pipelines-toolkit).
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/unipept/FragGeneScanRs">
              FragGeneScanRs
            </a>
          </td>
          <td>1.1.0</td>
          <td>CDS calling; this tool specializes in calling fragmented CDS</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EBI-Metagenomics/mgnify-pipelines-toolkit">
              generategaf
            </a>
          </td>
          <td>1.2.0</td>
          <td>
            Script that generates a GO Annotation File (GAF) from an
            InterProScan result TSV file (this tool is part of the
            mgnify-pipelines-toolkit).
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://www.ebi.ac.uk/interpro/genomeproperties/">
              Genome Properties
            </a>
          </td>
          <td>2.0</td>
          <td>
            Uses protein signatures as evidence to determine the presence of
            each step within a property
          </td>
        </tr>
        <tr>
          <td>
            <a href="http://eddylab.org/infernal/">Infernal - cmscan</a>
          </td>
          <td>1.1.5</td>
          <td>RNA sequence searching</td>
        </tr>
        <tr>
          <td>
            <a href="https://www.ebi.ac.uk/interpro/download/InterProScan/">
              InterProScan
            </a>
          </td>
          <td>5.76-107.0</td>
          <td>
            Functionally characterizes nucleotide or protein sequences by
            scanning them against the InterPro database.
          </td>
        </tr>
        <tr>
          <td>
            <a href="http://hmmer.org/">HMMER</a>
          </td>
          <td>3.4</td>
          <td>Used to annotate CDS with KO</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/marbl/Krona/wiki/KronaTools">Krona</a>
          </td>
          <td>2.8.1</td>
          <td>Krona chart visualization</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EBI-Metagenomics/kegg-pathways-completeness-tool">
              kegg-pathways-completeness
            </a>
          </td>
          <td>1.3.0</td>
          <td>
            Computes the completeness of each KEGG pathway module based on KEGG
            orthologue (KO) annotations.
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/EBI-Metagenomics/mgnify-pipelines-toolkit">
              MGnify pipelines toolkit
            </a>
          </td>
          <td>1.2.0</td>
          <td>Collection of tools and scripts used in MGnify pipelines.</td>
        </tr>
        <tr>
          <td>
            <a href="https://lh3.github.io/minimap2/">minimap2</a>
          </td>
          <td>2.29-r1283</td>
          <td>
            A versatile pairwise aligner for genomic and spliced nucleotide
            sequences. Used in the assembly decontamination subworkflow
          </td>
        </tr>
        <tr>
          <td>
            <a href="http://multiqc.info/">MultiQC</a>
          </td>
          <td>1.29</td>
          <td>Tool to aggregate bioinformatic analysis results.</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/owlcollab/owltools">Owltools</a>
          </td>
          <td>2024-06-12T00:00:00Z</td>
          <td>Tool utilized to map GO terms to GO-slims</td>
        </tr>
        <tr>
          <td>
            <a href="https://pyrodigal.readthedocs.org/">Pyrodigal</a>
          </td>
          <td>3.6.3</td>
          <td>CDS calling</td>
        </tr>
        <tr>
          <td>
            <a href="https://zlib.net/pigz/">pigz</a>
          </td>
          <td>2.3.4</td>
          <td>
            A parallel implementation of gzip for modern multi-processor,
            multi-core systems
          </td>
        </tr>
        <tr>
          <td>
            <a href="http://quast.sourceforge.net/quast">QUAST</a>
          </td>
          <td>5.2.0</td>
          <td>
            Tool used evaluates genome assemblies, it’s part of the pipeline QC
            module.
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/bcb-unl/run_dbcan">run_dbCAN</a>
          </td>
          <td>5.1.2</td>
          <td>
            Annotation tool for the Carbohydrate-Active-enzymes Database (CAZy)
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://bioinf.shenwei.me/seqkit/">SeqKit</a>
          </td>
          <td>2.8.0</td>
          <td>Used to manipulate FASTA files</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/Finn-Lab/SanntiS">SanntiS</a>
          </td>
          <td>0.9.4.1</td>
          <td>Tool used to identify biosynthetic gene clusters</td>
        </tr>
        <tr>
          <td>
            <a href="http://www.htslib.org/doc/tabix.html">tabix</a>
          </td>
          <td>1.21</td>
          <td>Generic indexer for TAB-delimited genome position files</td>
        </tr>
        <tr>
          <td>
            <a href="https://genometools.org/tools/gt_gff3validator.html">
              Genome Tools - gff3validator
            </a>
          </td>
          <td>1.6.5</td>
          <td>Used to validate the analysis summary GFF file</td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/jqlang/jq">jq</a>
          </td>
          <td>1.5</td>
          <td>Used to concatenate the chunked antiSMASH json results</td>
        </tr>
      </tbody>
    </table>
    <table className="stack hover responsive-table">
      <thead>
        <tr>
          <th>Reference database</th>
          <th>Version</th>
          <th>Purpose</th>
          <th>Download</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a href="https://rfam.org/">Rfam covariance models</a>
          </td>
          <td>15</td>
          <td>rRNA covariance models</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/Rfam/15.0/Rfam.cm.gz">
              ftp://ftp.ebi.ac.uk/pub/databases/Rfam/15.0/Rfam.cm.gz
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://rfam.org/">Rfam clan info</a>
          </td>
          <td>15</td>
          <td>rRNA clan information</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/Rfam/15.0/Rfam.clanin">
              ftp://ftp.ebi.ac.uk/pub/databases/Rfam/15.0/Rfam.clanin
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://www.ebi.ac.uk/interpro/download/InterProScan/">
              InterProScan
            </a>
          </td>
          <td>5.73-104.0</td>
          <td>InterProScan reference database</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/software/unix/iprscan/5/5.73-104.0/">
              ftp://ftp.ebi.ac.uk/pub/software/unix/iprscan/5/5.73-104.0/
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/eggnogdb/eggnog-mapper/wiki/eggNOG-mapper-v2.1.5-to-v2.1.12#requirements">
              eggNOG-mapper
            </a>
          </td>
          <td>5.0.2</td>
          <td>eggNOG-mapper annotation databases and Diamond</td>
          <td>
            <a href="https://github.com/eggnogdb/eggnog-mapper/wiki/eggNOG-mapper-v2.1.5-to-v2.1.12#requirements">
              https://github.com/eggnogdb/eggnog-mapper/wiki/eggNOG-mapper-v2.1.5-to-v2.1.12#requirements
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://rfam.org/">antiSMASH</a>
          </td>
          <td>8.0.1</td>
          <td>The antiSMASH reference database</td>
          <td>
            <a href="https://docs.antismash.secondarymetabolites.org/install/#antismash-standalone-lite">
              https://docs.antismash.secondarymetabolites.org/install/#antismash-standalone-lite
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://www.genome.jp/tools/kofamkoala/">KOFAM</a>
            <sup>*</sup>
          </td>
          <td>2025-04</td>
          <td>
            KOfam - HMM profiles for KEGG/KO. Our reference generation pipeline
            generates the required files
          </td>
          <td>
            <a href="https://github.com/EBI-Metagenomics/reference-databases-preprocessing-pipeline">
              https://github.com/EBI-Metagenomics/reference-databases-preprocessing-pipeline
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://geneontology.org/docs/go-subset-guide/">
              GO Slims
            </a>
            <sup>*</sup>
          </td>
          <td>20160705</td>
          <td>Metagenomics GO Slims</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/goslim/20160705/goslim_20160705.tar.gz">
              ftp://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/goslim/20160705/goslim_20160705.tar.gz
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://dbcan.readthedocs.io/en/latest/installation.html#build-database">
              run_dbCAN
            </a>
          </td>
          <td>4.1.4-V13</td>
          <td>Pre-built run_DBCan reference database</td>
          <td>
            <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/dbcan/dbcan_4.1.3_V12.tar.gz">
              ftp://ftp.ebi.ac.uk/pub/databases/metagenomics/pipelines/tool-dbs/dbcan/dbcan_4.1.3_V12.tar.gz
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/MGXlab/CAT_pack">CAT_Pack</a>
          </td>
          <td>2025_01</td>
          <td>CAT/BAT/RAT NCBI taxonomy pre-made reference database</td>
          <td>
            <a href="https://github.com/MGXlab/CAT_pack?tab=readme-ov-file#downloading-preconstructed-database-files">
              https://github.com/MGXlab/CAT_pack?tab=readme-ov-file#downloading-preconstructed-database-files
            </a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="https://github.com/WrightonLabCSU/DRAM">DRAM</a>
          </td>
          <td>1.3.0</td>
          <td>DRAM databases</td>
          <td>
            <a href="https://github.com/WrightonLabCSU/DRAM/wiki#dram-setup">
              https://github.com/WrightonLabCSU/DRAM/wiki#dram-setup
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <blockquote>
      <strong>Note:</strong> Databases marked with <sup>*</sup> are downloaded
      and post-processed by the{' '}
      <a href="https://github.com/EBI-Metagenomics/reference-databases-preprocessing-pipeline">
        Microbiome Informatics reference-databases-preprocessing-pipeline
      </a>
      , and ready-to-use versions are stored on the EBI FTP server.
    </blockquote>
  </>
);

export const Table6: React.FC = () => {
  return (
    <div>
      <RouteForHash hash="" isDefault>
        <Table6Amplicon />
      </RouteForHash>
      <RouteForHash hash="#raw">
        <Table6Raw />
      </RouteForHash>
      <RouteForHash hash="#assembly">
        <Table6Assembly />
      </RouteForHash>
    </div>
  );
};
