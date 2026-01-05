import React, { useContext, useEffect } from 'react';
import FetchError from 'components/UI/FetchError';
import Loading from 'components/UI/Loading';
import { uniqBy } from 'lodash-es';
import { Link } from 'react-router-dom';
import { Publication, PublicationList, SampleDetail } from '@/interfaces';
import axios from 'axios';
import InfoBanner from 'components/UI/InfoBanner';
import PublicationAnnotations from 'components/Publications/EuropePMCAnnotations';
import UserContext from 'pages/Login/UserContext';

const AnnotationMetadata: React.FC<{ sample: SampleDetail }> = ({ sample }) => {
  const [allPublications, setAllPublications] = React.useState<Publication[]>(
    []
  );
  const { config } = useContext(UserContext);
  const [error, setError] = React.useState<any>(null);
  const [loadingPublications, setLoadingPublications] = React.useState(true);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const responses = await Promise.all(
          (sample.studies ?? []).map((study) =>
            axios.get<PublicationList>(
              `${config.api_v2}studies/${study.accession}/publications`,
              { signal: ac.signal }
            )
          )
        );
        const pubs: Publication[] = responses.flatMap(
          (r) => r.data.items ?? []
        );
        setAllPublications(pubs);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err);
      }
    })();
    setLoadingPublications(false);
    return () => ac.abort();
  }, [config.api_v2, sample.studies]);

  if (loadingPublications) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;

  if (allPublications.length === 0) {
    return (
      <InfoBanner type="info" title="No publications found for this sample." />
    );
  }

  return (
    <div className="vf-box vf-box-theme--primary vf-box--easy">
      <h5 className="vf-box__heading">Additional metadata from Publications</h5>
      <p className="vf-box__text">
        Additional metadata that may relate to this sample is available via
        publications linked to the sample’s studies.
      </p>
      <div className="vf-stack vf-stack-800">
        {uniqBy(allPublications, 'pubmed_id').map((pub) => (
          <article
            className="vf-card vf-card--brand vf-card--bordered"
            key={pub.pubmed_id}
          >
            <div className="vf-card__content | vf-stack vf-stack--400">
              <h3 className="vf-card__heading">
                <Link to={`/publications/${pub.pubmed_id}`}>{pub.title}</Link>
              </h3>
              <PublicationAnnotations
                pubmedId={String(pub.pubmed_id)}
                key={pub.pubmed_id}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AnnotationMetadata;
