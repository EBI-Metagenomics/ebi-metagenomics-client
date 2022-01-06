import { useContext } from 'react';

import useData, {
  MGnifyResponseGenericObj,
  ResponseFormat,
} from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';

const useMgnifyBigsiSearch: (
  sequence: string,
  threshold: number,
  cataloguesFilter: string
) => MGnifyResponseGenericObj = (sequence, threshold, cataloguesFilter) => {
  const { config } = useContext(UserContext);
  const formData = new FormData();
  formData.append('seq', sequence);
  formData.append('threshold', String(threshold));
  formData.append('catalogues_filter', cataloguesFilter);

  const data = useData(
    sequence.length && String(threshold).length && cataloguesFilter.length
      ? `${config.api}genome-search`
      : null,
    ResponseFormat.JSON,
    {
      method: 'POST',
      body: formData,
    }
  );
  return data as MGnifyResponseGenericObj;
};

export default useMgnifyBigsiSearch;
