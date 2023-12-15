import React from 'react';
import { vfBannerElixir } from '@visual-framework/vf-banner-elixir/vf-banner-elixir';

const ElixirBanner: React.FC = () => {
  vfBannerElixir();
  return (
    <section className="vf-u-fullbleed | vf-u-background-color-ui--grey--light">
      <div
        className="vf-banner-elixir vf-banner"
        data-vf-js-banner-elixir=""
        data-vf-js-banner-elixir-logo="https://ebi.emblstatic.net/web_guidelines/EBI-Framework/v1.4/images/logos/ELIXIR/elixir-cdr.gif"
        data-vf-js-banner-elixir-name="MGnify"
        data-vf-js-banner-elixir-description="MGnify is an ELIXIR Core Data Resource"
        data-vf-js-banner-elixir-link="default"
      />
    </section>
  );
};

export default ElixirBanner;
