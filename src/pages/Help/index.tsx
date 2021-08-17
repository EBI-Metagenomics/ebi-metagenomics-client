import React from 'react';
import './style.css';

const HelpPage: React.FC = () => {
  return (
    <section className="vf-content mg-help-section">
      <h2>Help</h2>
      <p>
        MGnify is a freely available hub for the analysis and exploration of
        metagenomic, metatranscriptomic, amplicon and assembly data. The
        resource provides rich functional and taxonomic analyses of
        user-submitted sequences, as well as analysis of publicly available
        metagenomic datasets drawn from the European Nucleotide Archive (ENA).
      </p>

      <article>
        <h3>
          <span className="icon icon-generic" data-icon=";" /> User
          Documentation
        </h3>
        <p>
          Full user documentation of the MGnify service is located at{' '}
          <a
            id="doc-link-2"
            title="MGnify docs"
            className="ext"
            href="https://emg-docs.readthedocs.io/en/latest/"
          >
            Read the Docs
          </a>
          .
        </p>
        <p>
          The text is searchable and may be downloaded in a variety of formats.
          Users may also choose to view the documentation for specific pipeline
          versions (accessed via the bottom left hand corner of the page).
          Answers to many of the most commonly asked questions can be found
          under the{' '}
          <a
            className="ext"
            href="https://emg-docs.readthedocs.io/en/latest/faqs.html"
          >
            FAQ
          </a>
          .
        </p>
      </article>

      <article>
        <h3>
          <span className="icon icon-functional" data-icon="1" /> Sequence
          search
        </h3>
        <p>
          This allows protein sequence searches of representatives from our
          non-redundant protein database using HMMER. Comprehensive
          documentation on the HMMER web service, including API, is available at
          <a
            className="ext"
            href="https://hmmer-web-docs.readthedocs.io/en/latest/index.html"
          >
            {' '}
            HMMER Read the Docs site
          </a>
          . The options specifically associated with the MGnify sequence search
          service are provided in the User Documentation above. The complete
          protein databases is available for download and local sequence
          searching below.
        </p>
      </article>

      <article>
        <h3>
          <span className="icon icon-functional" data-icon="=" /> Downloading
          our protein sequence database
        </h3>
        <p>
          The MGnify protein database is now so large, that we can not provide a
          service to allow a search against the complete collection (currently
          over 1 billion sequences). Both the cluster representatives and
          complete database are available for download from{' '}
          <a
            id="ftp-link"
            title="MGnify protein database FTP"
            className="ext"
            href="http://ftp.ebi.ac.uk/pub/databases/metagenomics/peptide_database/current_release"
          >
            here
          </a>
          . We periodically update this dataset (approximately every 6 months),
          so please ensure you know the version you are using. Pfam annotations
          and exact matches to UniProtKB are also provided. Please view the{' '}
          <a
            id="ftp-readme-link"
            title="Protein database FTP readme"
            href="http://ftp.ebi.ac.uk/pub/databases/metagenomics/peptide_database/current_release/README.txt"
          >
            README.txt
          </a>
          for the complete list of files and their descriptions.
        </p>
      </article>
      <article>
        <h3>
          <span className="icon icon-generic" data-icon="t" /> Training
          materials
        </h3>

        <div>
          This provide training materials as part of the{' '}
          <a
            title="EBI Train online"
            href="https://www.ebi.ac.uk/training/online/about-train-online"
            className="ext"
          >
            EBI Train online
          </a>
          :
          <ul className="training">
            <li>
              <a
                title="Quick Tour"
                href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-quick-tour"
                className="ext"
              >
                Tutorial about the website
              </a>
            </li>
            <li>
              <a
                title="Submitting data to ENA"
                href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-submitting-metagenomics-da"
                className="ext"
              >
                Tutorial describing the data submission process
              </a>
            </li>
            <li>
              <a
                title="Analysis and exploration"
                href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-analysing-and-exploring-metagenomics-data"
                className="ext"
              >
                A webinar explaining about MGnify and the analysis you can
                perform
              </a>
            </li>
            <li>
              <a
                title="Metagenomics Bioinformatics course run at EMBL-EBI in 2018"
                href="https://www.ebi.ac.uk/training/online/course/metagenomics-bioinformatics"
                className="ext"
              >
                Recorded materials from the Metagenomics Bioinformatics course
                run at EMBL-EBI in 2018
              </a>
            </li>
          </ul>
        </div>
      </article>
      <article>
        <h3>
          <span className="icon icon-generic" data-icon="s" /> Contact us
        </h3>

        <p>
          If neither the documentation nor our online materials answer your
          questions, please{' '}
          <a
            title="EBI's support & feedback form"
            href="https://www.ebi.ac.uk/support/metagenomics"
            className="ext"
          >
            contact us
          </a>
          .
        </p>
      </article>
    </section>
  );
};

export default HelpPage;
