import React from 'react';

import ReactMarkdown from 'react-markdown';

import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseObj } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import FlagshipTable from 'components/SuperStudy/Flagship';
import RelatedTable from 'components/SuperStudy/Related';
import SuperStudyGenomeCataloguesTable from 'components/SuperStudy/GenomeCatalogues';
import Breadcrumbs from 'components/Nav/Breadcrumbs';

const SuperStudyPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`super-studies/${accession}`);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: superStudyData } = data as MGnifyResponseObj;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Super Studies', url: '/browse/super-studies' },
    { label: accession },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Super Study</h2>

      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <div style={{ display: 'flex' }}>
            <div>
              <h3>{superStudyData.attributes.title}</h3>
              <div data-cy="superStudyDescription">
                <ReactMarkdown>
                  {superStudyData.attributes.description as string}
                </ReactMarkdown>
              </div>
            </div>
            <img
              src={superStudyData.attributes['image-url'] as string}
              style={{
                height: '6em',
              }}
              alt={`${superStudyData.attributes.title} logo`}
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
