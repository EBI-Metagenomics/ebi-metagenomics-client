import React, { useEffect, useMemo } from 'react';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { useLocation } from 'react-router-dom';
import config from '@/utils/config';

const Matomo: React.FC = () => {
  const { trackPageView, enableLinkTracking } = useMatomo();
  const {pathname, search, hash} = useLocation();

  const trackableLocation = useMemo(
    () =>
      `${config.basename}${pathname}?${search}${hash}`,
    [pathname, search, hash]
  );

  useEffect(() => {
    trackPageView({
      href: trackableLocation,
    });
  }, [trackPageView, trackableLocation]);

  enableLinkTracking();
  return null;
};

export default Matomo;
