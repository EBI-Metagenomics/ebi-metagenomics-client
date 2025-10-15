import React, { useState, useContext, useEffect } from 'react';

import { Wrapper } from '@googlemaps/react-wrapper';

import UserContext from 'pages/Login/UserContext';
import SamplesMap from 'components/UI/SamplesMap';
import render from '../render';
import '../style.css';
import InfoBanner from '../../InfoBanner';
import useStudySamplesList from 'hooks/data/useStudySamples';
import Loading from 'components/UI/Loading';
import { Sample, StudyDetail } from '@/interfaces';
import { uniqBy } from 'lodash-es';
import { useCounter } from 'react-use';

const LIMIT = 1000;

type LoadMoreSamplesProps = {
  total: number;
  limit: number;
  handleRequest: () => void;
};

const LoadMoreSamples: React.FC<LoadMoreSamplesProps> = ({
  total,
  limit,
  handleRequest,
}) =>
  total > limit ? (
    <div>
      ⚠️ We are only loading the first {LIMIT} samples. Click{' '}
      <button
        type="button"
        className="vf-button vf-button--link mg-button-as-link"
        onClick={handleRequest}
      >
        HERE
      </button>{' '}
      to load them all.
    </div>
  ) : null;
type SamplesMapProps = {
  study: StudyDetail;
};
const SamplesMapByStudy: React.FC<SamplesMapProps> = ({ study }) => {
  const [limit, setLimit] = useState(LIMIT);
  const [currentPage, { inc: nextPage }] = useCounter(1);
  const [allSamples, setAllSamples] = useState<Array<Sample>>([]);

  const { config } = useContext(UserContext);

  const {
    data: samples,
    error,
    loading,
  } = useStudySamplesList(study.accession, {
    pageSize: 200,
    page: currentPage,
  });

  useEffect(() => {
    if (samples?.items) {
      setAllSamples((prev) =>
        uniqBy([...prev, ...samples.items], (sample) => sample.accession)
      );
    }
  }, [samples?.items]);

  useEffect(() => {
    if (samples?.count) {
      if (samples.count > allSamples.length && allSamples.length < limit) {
        nextPage();
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSamples.length, limit, nextPage]);

  if (error) {
    return (
      <InfoBanner type={'error'} title={'Could not fetch study’s samples'} />
    );
  }

  if (loading) {
    return <Loading />;
  }

  const samplesFiltered = allSamples.filter((sample) => {
    try {
      return (
        Number(sample?.metadata?.lon ?? false) !== 0.0 &&
        Number(sample?.metadata?.lat ?? false) !== 0.0
      );
    } catch {
      return false;
    }
  });
  if (samplesFiltered?.length === 0) {
    return (
      <InfoBanner type="info" title="Notice">
        None of the {(samples?.count ?? 0) > limit ? 'loaded' : ''} samples have
        geolocation co-ordinates.
        <LoadMoreSamples
          total={samples?.count ?? 0}
          limit={limit}
          handleRequest={() => setLimit(samples?.count || Infinity)}
        />
      </InfoBanner>
    );
  }

  return (
    <div className="mg-map-container">
      <div className="mg-map-wrapper">
        <Wrapper apiKey={config.googleMapsKey} render={render}>
          <SamplesMap samples={samplesFiltered || []} study={study}/>
        </Wrapper>
      </div>
      {samples?.count && (
        <div className="mg-map-progress">
          <progress max={samples?.count} value={allSamples.length} />
          <LoadMoreSamples
            total={samples?.count}
            limit={limit}
            handleRequest={() => setLimit(samples?.count)}
          />
        </div>
      )}
    </div>
  );
};

export default SamplesMapByStudy;
