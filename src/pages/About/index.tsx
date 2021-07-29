import React from 'react';
import Publications, { MainPublication } from 'components/Publications';

import './style.css';

import emblImg from 'images/funding/embl_logo.png';
import bbsrcImg from 'images/funding/BBSRC.png';
import excelerateImg from 'images/funding/excelerate_whitebackground.png';
import holofoodImg from 'images/funding/holofood.png';
import innovateImg from 'images/funding/innovate-uk-logo.png';

const AboutPage: React.FC = () => {
  return (
    <section className="vf-content">
      <h2>The MGnify resource</h2>
      <p>
        Microbiome research involves the study of all genomes present within a
        specific environment. The approach can provide unique insights into the
        complex processes performed by environmental micro-organisms and their
        relationship to their surroundings, to each other, and, in some cases,
        to their host.
      </p>
      <p>
        MGnify offers an automated pipeline for the analysis and archiving of
        microbiome data to help determine the taxonomic diversity and functional
        & metabolic potential of environmental samples. Users can submit their
        own data for analysis or freely browse all of the analysed public
        datasets held within the repository. In addition, users can request
        analysis of any appropriate dataset within the European Nucleotide
        Archive (ENA). User-submitted or ENA-derived datasets can also be
        assembled on request, prior to analysis.
      </p>
      <h2>Staying informed</h2>
      <p>
        Follow us on Twitter using{' '}
        <a href="https://twitter.com/MGnifyDB">@MGnifyDB</a>
      </p>
      <h2>Cite us</h2>
      <MainPublication />
      <h2>Latest publications</h2>
      <Publications />
      <h2>Funding</h2>
      <div className="vf-grid">
        <p>
          MGnify currently receives funding support from: the European Union’s
          Horizon 2020 Research and Innovation programme (817729 and 824087);
          the Biotechnology and Biological Sciences Research Council
          (BB/R015228/1, BB/S009043/1 and BB/N018354/1); ELIXIR, the research
          infrastructure for Life-Science data; and European Molecular Biology
          Laboratory (EMBL) core funds.
        </p>
        <div className="vf-grid vf-grid__col-2 mg-about-logos">
          <img src={emblImg} alt="embl logo" />
          <img src={bbsrcImg} alt="bbsrc logo" />
          <img src={excelerateImg} alt="excelerate logo" />
          <img src={innovateImg} alt="innovate logo" />
          <img src={holofoodImg} alt="holofood logo" />
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
