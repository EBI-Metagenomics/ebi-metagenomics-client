import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const SessionExpiryBanner: React.FC = () => {
  useEffect(() => {
    if (localStorage.getItem('mgnify.sessionExpired')) {
      localStorage.removeItem('mgnify.sessionExpired');
      toast.warning('Your login has expired. You have been logged out.', {
        toastId: 'mgnify-session-expired',
      });
    }
  }, []);

  return null;
};

export default SessionExpiryBanner;
