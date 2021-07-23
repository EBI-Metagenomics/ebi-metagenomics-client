import React, { useState } from 'react';
import config from 'config.json';

const CookieBanner: React.FC = () => {
  const [display, setDisplay] = useState(
    !!document && !(document.cookie.match(/cookies-accepted=(true)/i) || [])[1]
  );

  const handleClick: () => void = () => {
    const expires = new Date();
    // Set expire date to now + 1 year
    expires.setFullYear(expires.getFullYear() + 1);
    // eslint-disable-next-line max-len
    document.cookie = `cookies-accepted=true;expires=${expires.toUTCString()};path=${
      config.website
    }`;
    setDisplay(false);
  };
  if (!display) return null;
  return (
    <div
      className="vf-banner vf-banner--fixed vf-banner--bottom vf-banner--notice"
      data-vf-js-banner=""
      data-vf-js-banner-state="dismissible"
      data-vf-js-banner-button-text="NaN"
      data-vf-js-banner-cookie-name="NaN"
      data-vf-js-banner-cookie-version="NaN"
      data-vf-js-banner-auto-accept="false"
      data-vf-js-banner-id="6303666"
    >
      <div className="vf-banner__content | vf-grid" data-vf-js-banner-text="">
        <p className="vf-banner__text vf-banner__text--lg">
          This website uses cookies, and the limiting processing of your
          personal data to function. By using the site you are agreeing to this
          as outlined in our{' '}
          <a
            className="vf-banner__link"
            href="https://www.ebi.ac.uk/data-protection/privacy-notice/embl-ebi-public-website"
          >
            Privacy Notice
          </a>{' '}
          and{' '}
          <a
            className="vf-banner__link"
            href="https://www.ebi.ac.uk/about/terms-of-use"
          >
            Terms Of Use
          </a>
          .
        </p>

        <button
          className="vf-button vf-button--primary"
          data-vf-js-banner-close=""
          onClick={handleClick}
          type="button"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
