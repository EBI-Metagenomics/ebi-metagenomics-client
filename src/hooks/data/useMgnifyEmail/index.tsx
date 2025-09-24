import Cookies from 'universal-cookie';
import { useContext } from 'react';

import useData, {
  HTMLDataResponse,
  ResponseFormat,
} from '@/hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifyEmail: (
  fromEmail: string,
  subject: string,
  body: string,
  consent: boolean,
  cc?: string
) => HTMLDataResponse = (fromEmail, subject, body, consent, cc = '') => {
  const { config } = useContext(UserContext);
  const cookies = new Cookies();

  const data = useData(
    fromEmail ? `${config.api}@/utils/notify` : null,
    ResponseFormat.HTML,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': cookies.get('csrftoken'),
        'Content-Type': 'application/vnd.api+json',
      },
      credentials: 'include',
      body: JSON.stringify({
        data: {
          type: 'notifies',
          attributes: {
            from_email: fromEmail,
            cc,
            subject,
            message: body,
            is_consent: consent || false,
          },
        },
      }),
    }
  );
  return data as HTMLDataResponse;
};

export default useMgnifyEmail;
