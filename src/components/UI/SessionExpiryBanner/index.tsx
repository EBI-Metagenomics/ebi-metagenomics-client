import React, { useState, useEffect } from 'react';

const SessionExpiryBanner: React.FC = () => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    const sessionExpired = localStorage.getItem('mgnify.sessionExpired');
    if (sessionExpired) {
      setIsSessionExpired(true);
    }
  }, []);

  const closeBanner = (): void => {
    localStorage.removeItem('mgnify.sessionExpired');
    setIsSessionExpired(false);
  };

  if (!isSessionExpired) {
    return null;
  }

  return (
    <div className="vf-banner vf-banner--alert vf-banner--warning">
      <div className="vf-banner__content">
        <p className="vf-banner__text">
          Session expired. You have been logged out.
        </p>
        <button
          type="button"
          aria-label="close notification banner"
          className="vf-button vf-button--icon vf-button--dismiss | vf-banner__button"
          onClick={closeBanner}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>dismiss banner</title>
            <path d="M14.3,12.179a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.442L12.177,9.7a.25.25,0,0,1-.354,0L2.561.442A1.5,1.5,0,0,0,.439,2.563L9.7,11.825a.25.25,0,0,1,0,.354L.439,21.442a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,0,0,2.122-2.121Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SessionExpiryBanner;
