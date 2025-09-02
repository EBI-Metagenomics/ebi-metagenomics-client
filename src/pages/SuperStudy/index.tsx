import React, { useContext } from 'react';

import ReactMarkdown from 'react-markdown';
import useURLAccession from 'hooks/useURLAccession';
import FlagshipTable from 'components/SuperStudy/Flagship';
import RelatedTable from 'components/SuperStudy/Related';
import SuperStudyGenomeCataloguesTable from 'components/SuperStudy/GenomeCatalogues';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import useSuperStudyDetail from 'hooks/data/useSuperStudyDetail';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import UserContext from 'pages/Login/UserContext';

const SuperStudyPage: React.FC = () => {
  const slug = useURLAccession();
  const { config } = useContext(UserContext);
  const { data, loading, error } = useSuperStudyDetail(slug);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Super Studies', url: '/browse/super-studies' },
    { label: slug },
  ];
  const logoAbs = config.api_v2 + data.logo_url;
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Super Study</h2>

      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <div style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1 }}>
              <h3>{data.title}</h3>
              <div data-cy="superStudyDescription">
                <ReactMarkdown>{data.description as string}</ReactMarkdown>
              </div>
            </div>
            <img
              src={logoAbs}
              style={{
                height: '6em',
              }}
              alt={`${data.title} logo`}
              data-cy="superStudyLogo"
            />
          </div>
          <FlagshipTable />
          <RelatedTable />
          <SuperStudyGenomeCataloguesTable />
        </div>
      </section>
    </section>
  );
};

export default SuperStudyPage;
