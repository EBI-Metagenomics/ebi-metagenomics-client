import React from 'react';

const ElixirBanner: React.FC = () => {
  return (
    <section className="vf-u-fullbleed | vf-u-background-color-ui--grey--light">
      <div
        className="vf-banner-elixir vf-banner"
        data-vf-js-banner-elixir=""
        data-vf-js-banner-elixir-logo=""
        data-vf-js-banner-elixir-name="MGnify"
        data-vf-js-banner-elixir-description="The MGnify platform facilitates the assembly, analysis and archiving of microbiome-derived nucleic acid sequences. The platform provides access to taxonomic assignments and functional annotations for nearly half a million analyses covering metabarcoding, metatranscriptomic, and metagenomic datasets, which are derived from a wide range of different environments."
        data-vf-js-banner-elixir-link="default"
      >
        <div className="vf-flag vf-flag--middle vf-flag--400">
          <div className="vf-flag__media">
            <a href="http://www.elixir-europe.org" className="vf-banner__link">
              <img
                src="https://ebi.emblstatic.net/web_guidelines/EBI-Framework/v1.2/images/logos/assorted/elixir_kitemark-60px.png"
                alt="ELIXIR Logo"
              />
            </a>
          </div>
          <div className="vf-flag__body">
            <h4 className="vf-banner__text--lg">
              <a href="http://www.elixir-europe.org" className="vf-link">
                MGnify is part of the ELIXIR infrastructure
              </a>
            </h4>
            <p className="vf-banner__text">
              MGnify is an ELIXIR Core Data Resource{' '}
              <a
                className="vf-banner__link"
                href="https://elixir-europe.org/platforms/data/core-data-resources"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElixirBanner;
