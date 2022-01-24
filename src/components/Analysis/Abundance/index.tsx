import React, { useContext } from 'react';

import AnalysisContext from 'pages/Analysis/AnalysisContext';
import useData, { ResponseFormat } from 'hooks/data/useData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

const Abundance: React.FC = () => {
  const { included } = useContext(AnalysisContext);
  const stats = included.find(
    (item) => item?.attributes?.['group-type'] === 'Statistics'
  );
  const { data, error, loading } = useData(
    stats.links.self,
    ResponseFormat.TXT
  );
  if (!stats) return <p>No abundance found in the data</p>;
  return (
    <section>
      <p>
        This page gives you information regarding metagenomic community
        diversity estimation and information which allow comparisons between all
        study runs. The following plots illustrate the taxa abundance
        distribution.
      </p>
      {loading && <Loading />}
      {!loading && error && <FetchError error={error} />}
      {
        // eslint-disable-next-line react/no-danger
        data && <div dangerouslySetInnerHTML={{ __html: data as string }} />
      }
    </section>
  );
};
export default Abundance;
