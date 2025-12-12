import React from 'react';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Box from 'components/UI/Box';
import KeyValueList, { KeyValueItemsList } from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import AssociatedStudies from 'components/Study/Studies';
import PublicationAnnotations from 'components/Publications/EuropePMCAnnotations';
import usePublicationDetail from 'hooks/data/usePublicationDetail';
import { PublicationEuropePmcCore } from '@/interfaces';
import { useEffectOnce } from 'react-use';

const PublicationPage: React.FC = () => {
  const pubmedId = useURLAccession();
  const {
    data: publicationData,
    loading,
    error,
    abstractGetter,
  } = usePublicationDetail(parseInt(pubmedId as string, 10));

  const [europePmcData, setEuropePMCData] =
    React.useState<PublicationEuropePmcCore>();

  useEffectOnce(() => {
    abstractGetter()
      .then((response) => setEuropePMCData(response.data))
      .catch(() => setEuropePMCData(undefined));
  });

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!publicationData || !pubmedId) return <Loading />;

  const details = [
    {
      key: 'Journal name',
      value: publicationData.metadata.iso_journal,
    },
    {
      key: 'DOI',
      value: () => (
        <ExtLink href={`https://www.doi.org/${publicationData.metadata.doi}`}>
          {publicationData.metadata.doi}
        </ExtLink>
      ),
    },
    {
      key: 'PMID',
      value: () => (
        <ExtLink
          href={`https://europepmc.org/abstract/MED/${publicationData.pubmed_id}`}
        >
          {publicationData.pubmed_id}
        </ExtLink>
      ),
    },
    {
      key: 'Published year',
      value: String(publicationData.published_year),
    },
  ] as KeyValueItemsList;
  return (
    <section className="vf-content">
      <h2>Publication: {publicationData.title || ''}</h2>
      <h4>{publicationData.metadata?.authors || ''}</h4>
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          {europePmcData?.result?.abstractText && (
            <div>{europePmcData.result.abstractText}</div>
          )}
          <Box label="Publication details">
            <KeyValueList list={details} />
          </Box>
          <Box label="Europe PMC Annotations">
            <PublicationAnnotations pubmedId={pubmedId} />
          </Box>
          <Box label="Associated studies">
            <AssociatedStudies associatedStudies={publicationData.studies} />
          </Box>
        </div>
      </section>
    </section>
  );
};

export default PublicationPage;
