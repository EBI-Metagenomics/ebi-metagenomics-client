import React from 'react';
import { Link } from 'react-router-dom';
import ExtLink from 'components/UI/ExtLink';

import ArrowForLink from 'components/UI/ArrowForLink';

const HelpPage: React.FC = () => {
  return (
    <section>
      <div className="vf-section-header">
        <h2 className="vf-section-header__heading">Help</h2>
        <p className="vf-section-header__text">
          MGnify is a freely available hub for the analysis and exploration of
          metagenomic, metatranscriptomic, amplicon and assembly data. The
          resource provides rich functional and taxonomic analyses of
          user-submitted sequences, as well as analysis of publicly available
          metagenomic datasets drawn from the European Nucleotide Archive (ENA).
        </p>
      </div>
      <hr className="vf-divider" />
      <div className="vf-stack vf-stack--800">
        <article className="vf-card vf-card--brand vf-card--bordered">
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">
              <a href="https://emg-docs.readthedocs.io/en/latest/">
                <span className="icon icon-generic" data-icon=";" /> User
                documentation
                <ArrowForLink />
              </a>
            </h3>
            <p className="vf-card__text">
              Full user documentation of the MGnify service is located at{' '}
              <ExtLink
                id="doc-link-2"
                title="MGnify docs"
                href="https://emg-docs.readthedocs.io/en/latest/"
              >
                Read the Docs
              </ExtLink>
              .
            </p>
            <p className="vf-card__text">
              The text is searchable and may be downloaded in a variety of
              formats. Users may also choose to view the documentation for
              specific pipeline versions (accessed via the bottom left hand
              corner of the page). Answers to many of the most commonly asked
              questions can be found under the{' '}
              <ExtLink href="https://emg-docs.readthedocs.io/en/latest/faqs.html">
                FAQ
              </ExtLink>
              .
              <br />
              Alternatively you can see a high level view of the pipelines{' '}
              <Link to="/pipelines">HERE</Link>.
            </p>
          </div>
        </article>

        <article className="vf-card vf-card--brand vf-card--bordered">
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">
              <a href="https://hmmer-web-docs.readthedocs.io/en/latest/index.html">
                <span className="icon icon-functional" data-icon="1" /> Sequence
                search
                <ArrowForLink />
              </a>
            </h3>
            <p className="vf-card__text">
              This allows protein sequence searches of representatives from our
              non-redundant protein database using HMMER. Comprehensive
              documentation on the HMMER web service, including API, is
              available at{' '}
              <ExtLink href="https://hmmer-web-docs.readthedocs.io/en/latest/index.html">
                {' '}
                HMMER Read the Docs site
              </ExtLink>
              . The options specifically associated with the MGnify sequence
              search service are provided in the User Documentation above. The
              complete protein databases is available for download and local
              sequence searching below.
            </p>
          </div>
        </article>

        <article className="vf-card vf-card--brand vf-card--bordered">
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">
              <a href="https://shiny-portal.embl.de/shinyapps/app/06_mgnify-notebook-lab?jlpath=mgnify-examples/home.ipynb">
                <i className="icon icon-common icon-code" /> Programmatic access
                and examples
                <ArrowForLink />
              </a>
            </h3>
            <p className="vf-card__text">
              MGnify data can be access programmatically using{' '}
              <ExtLink href="https://www.ebi.ac.uk/metagenomics/api">
                {' '}
                the API
              </ExtLink>
              . The API allows you to use command-line tools, like{' '}
              <ExtLink href="https://curl.se">curl</ExtLink> to search for and
              download data. You can also discover the API’s endpoints by
              visiting it in a web browser. The{' '}
              <ExtLink href="https://shiny-portal.embl.de/shinyapps/app/06_mgnify-notebook-lab?jlpath=mgnify-examples/home.ipynb">
                MGnify Jupyter Lab
              </ExtLink>{' '}
              server hosts examples of data analysis using R and Python. These
              are live examples that you can modify without downloading or
              installing any software.
            </p>
          </div>
        </article>

        <article className="vf-card vf-card--brand vf-card--bordered">
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">
              <a href="http://ftp.ebi.ac.uk/pub/databases/metagenomics/peptide_database/current_release/README.txt">
                <span className="icon icon-functional" data-icon="=" />{' '}
                Downloading our protein sequence database
                <ArrowForLink />
              </a>
            </h3>
            <p className="vf-card__text">
              The MGnify protein database is now so large, that we can not
              provide a service to allow a search against the complete
              collection (currently over 1 billion sequences). Both the cluster
              representatives and complete database are available for download
              from{' '}
              <ExtLink
                id="ftp-link"
                title="MGnify protein database FTP"
                href="http://ftp.ebi.ac.uk/pub/databases/metagenomics/peptide_database/current_release"
              >
                here
              </ExtLink>
              . We periodically update this dataset (approximately every 6
              months), so please ensure you know the version you are using. Pfam
              annotations and exact matches to UniProtKB are also provided.
              Please view the{' '}
              <a
                id="ftp-readme-link"
                title="Protein database FTP readme"
                href="http://ftp.ebi.ac.uk/pub/databases/metagenomics/peptide_database/current_release/README.txt"
              >
                README.txt
              </a>
              for the complete list of files and their descriptions.
            </p>
          </div>
        </article>

        <article className="vf-card vf-card--brand vf-card--bordered">
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">
              <a href="https://www.ebi.ac.uk/training/online/about-train-online">
                <span className="icon icon-generic" data-icon="t" /> Training
                materials
                <ArrowForLink />
              </a>
            </h3>
            <div>
              This provide training materials as part of the{' '}
              <ExtLink
                title="EBI Train online"
                href="https://www.ebi.ac.uk/training/online/about-train-online"
              >
                EBI Train online
              </ExtLink>
              :
              <ul className="training">
                <li>
                  <ExtLink
                    title="Quick Tour"
                    href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-quick-tour"
                  >
                    Tutorial about the website
                  </ExtLink>
                </li>
                <li>
                  <ExtLink
                    title="Submitting data to ENA"
                    href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-submitting-metagenomics-da"
                  >
                    Tutorial describing the data submission process
                  </ExtLink>
                </li>
                <li>
                  <ExtLink
                    title="Analysis and exploration"
                    href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-analysing-and-exploring-metagenomics-data"
                  >
                    A webinar explaining about MGnify and the analysis you can
                    perform
                  </ExtLink>
                </li>
                <li>
                  <ExtLink
                    title="Metagenomics Bioinformatics course run at EMBL-EBI in 2018"
                    href="https://www.ebi.ac.uk/training/online/course/metagenomics-bioinformatics"
                  >
                    Recorded materials from the Metagenomics Bioinformatics
                    course run at EMBL-EBI in 2018
                  </ExtLink>
                </li>
              </ul>
            </div>
          </div>
        </article>

        <article className="vf-card vf-card--brand vf-card--bordered">
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">
              <a href="https://www.ebi.ac.uk/support/metagenomics">
                <span className="icon icon-generic" data-icon="s" /> Contact us
                <ArrowForLink />
              </a>
            </h3>
            <p className="vf-card__text">
              If neither the documentation nor our online materials answer your
              questions, please{' '}
              <ExtLink
                title="EBI's support & feedback form"
                href="https://www.ebi.ac.uk/support/metagenomics"
              >
                contact us
              </ExtLink>
              .
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default HelpPage;
