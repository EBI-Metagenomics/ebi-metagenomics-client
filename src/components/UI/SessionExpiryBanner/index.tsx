import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const SessionExpiryBanner: React.FC = () => {
  useEffect(() => {
    if (!localStorage.getItem('mgnify.sessionExpired')) return undefined;

    // Wait for ToastContainer's Strict Mode remount before consuming the flag.
    const notification = window.setTimeout(() => {
      if (localStorage.getItem('mgnify.sessionExpired')) {
        localStorage.removeItem('mgnify.sessionExpired');
        toast.warning('Your login has expired. You have been logged out.', {
          toastId: 'mgnify-session-expired',
        });
      }
    }, 0);
    return () => window.clearTimeout(notification);
  }, []);

  return null;
};

export default SessionExpiryBanner;
