import React from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Box from 'components/UI/Box';
import KeyValueList from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import AssociatedStudies from 'components/Study/Studies';

const PublicationPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`publications/${accession}`);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: publicationData } = data as MGnifyResponseObj;

  const details = [
    {
      key: 'Journal name',
      value: publicationData.attributes['iso-journal'] as string,
    },
    {
      key: 'DOI',
      value: () => (
        <ExtLink href={`https://www.doi.org/${publicationData.attributes.doi}`}>
          {publicationData.attributes.doi}
        </ExtLink>
      ),
    },
    {
      key: 'PMID',
      value: () => (
        <ExtLink
          href={`https://europepmc.org/abstract/MED/${publicationData.id}`}
        >
          {publicationData.id}
        </ExtLink>
      ),
    },
    {
      key: 'Published year',
      value: String(publicationData.attributes['published-year']),
    },
  ];
  if (publicationData.attributes['medline-journal']) {
    details.push({
      key: 'Medical journal',
      value: () => (
        <ExtLink href={publicationData.attributes['medline-journal'] as string}>
          {publicationData.attributes['medline-journal']}
        </ExtLink>
      ),
    });
  }
  return (
    <section className="vf-content">
      <h2>Publication: {publicationData?.attributes?.['pub-title'] || ''}</h2>
      <h4>{publicationData?.attributes?.authors || ''}</h4>
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          {publicationData?.attributes?.abstract && (
            <div>{publicationData.attributes.abstract}</div>
          )}
          <Box label="Publication details">
            <KeyValueList list={details} />
          </Box>
          <Box label="Associated studies">
            <AssociatedStudies rootEndpoint="publications" />
          </Box>
        </div>
      </section>
    </section>
  );
};

export default PublicationPage;
