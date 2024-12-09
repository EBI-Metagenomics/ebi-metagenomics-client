import React, { useEffect, useState } from 'react';

interface TrainingData {
  entries: Array<{
    id: string;
    fields: {
      type: string;
      url: string[];
      title: string;
      description: string[];
      status: string;
      date_time_clean: string;
      venue: string;
      subtitle?: string[];
    };
  }>;
}

const TrainingCourses = () => {
  const [liveData, setLiveData] = useState<TrainingData | null>(null);
  const [onDemandData, setOnDemandData] = useState<TrainingData | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    const { hash } = window.location;
    return hash === '#training__section--2'
      ? 'training__section--2'
      : 'training__section--1';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (
        hash === '#training__section--1' ||
        hash === '#training__section--2'
      ) {
        setActiveTab(hash.substring(1));

        setTimeout(() => {
          const tabsElement = document.getElementById('training-tabs');
          if (tabsElement) {
            const offset = 100;
            const elementPosition = tabsElement.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }
        }, 100);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleTabClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tabId: string
  ) => {
    event.preventDefault();
    setActiveTab(tabId);
    window.history.pushState(null, '', `#${tabId}`);
  };

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [liveResponse, onDemandResponse] = await Promise.all([
          fetch(
            'https://www.ebi.ac.uk/ebisearch/ws/rest/ebiweb_training_events?format=json&query=domain_source:ebiweb_training_events%20AND%20timeframe:upcoming&start=0&size=2&fieldurl=true&fields=title,description,start_date,end_date,date_time_clean,resource_training_page,type,training_type,url,venue,materials,status,timeframe,resource_training_page,course_image&facetcount=50&sort=start_date&facets=resource_training_page:MGnify'
          ),
          fetch(
            'https://www.ebi.ac.uk/ebisearch/ws/rest/ebiweb_training_online?format=json&query=domain_source:ebiweb_training_online&start=0&size=2&fields=title,subtitle,description,type,url&sort=title&facets=resource_training_page:MGnify'
          ),
        ]);

        const [liveResponseData, onDemandResponseData] = await Promise.all([
          liveResponse.json(),
          onDemandResponse.json(),
        ]);

        setLiveData(liveResponseData);
        setOnDemandData(onDemandResponseData);
      } catch (err) {
        setError('Failed to fetch training data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  const formatDesc = (content: string) => {
    const safeContent = content.replace(/(<([^>]+)>)/gi, '');
    return safeContent.length > 200
      ? `${safeContent.slice(0, 200).split(' ').slice(0, -1).join(' ')}...`
      : safeContent;
  };

  const renderEmptyState = (type: 'live' | 'onDemand') => (
    // <div className="vf-grid vf-grid__col-1 vf-u-padding__top--800">
    <div className="vf-grid">
      <div className="vf-summary vf-summary--event">
        <p className="vf-summary__text space">
          {type === 'live'
            ? 'Currently there are no upcoming events - please see our on-demand training which includes materials from past courses.\n'
            : 'On-demand training materials are currently unavailable. Please check back later for new content.'}
        </p>
      </div>
    </div>
  );

  const renderLiveContent = () => {
    if (isLoading) {
      return (
        <div className="vf-u-padding__top--400">
          Loading live training sessions...
        </div>
      );
    }

    if (!liveData || !liveData.entries || liveData.entries.length === 0) {
      return renderEmptyState('live');
    }

    return (
      <div className="vf-grid vf-grid__col-2">
        {liveData.entries.map((item) => (
          <div key={item.id} className="vf-summary vf-summary--event">
            <p className="vf-summary__date">{item.fields.type}</p>
            <h3 className="vf-summary__title">
              <a
                href={item.fields.url[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="vf-summary__link"
              >
                {item.fields.title}
              </a>
            </h3>
            <div>
              <div className="vf-summary__text">
                {formatDesc(item.fields.description[0])}
              </div>
              <div className="vf-summary__location">
                <div className="vf-u-margin__top--400" />
                <span>{item.fields.status}</span> |{' '}
                <span>
                  <i className="icon icon-common icon-calendar-alt" />
                  {item.fields.date_time_clean}
                </span>
                <span>
                  {' '}
                  | <i className="icon icon-common icon-location" />
                  {item.fields.venue === 'null' ? 'Online' : item.fields.venue}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOnDemandContent = () => {
    if (isLoading) {
      return (
        <div className="vf-u-padding__top--400">
          Loading on-demand training content...
        </div>
      );
    }

    if (
      !onDemandData ||
      !onDemandData.entries ||
      onDemandData.entries.length === 0
    ) {
      return renderEmptyState('onDemand');
    }

    return (
      <div className="vf-grid vf-grid__col-2">
        {onDemandData.entries.map((item) => (
          <div key={item.id} className="vf-summary vf-summary--event">
            <p className="vf-summary__date">{item.fields.type}</p>
            <h3 className="vf-summary__title">
              <a
                href={item.fields.url[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="vf-summary__link"
              >
                {item.fields.title}
                {item.fields.subtitle?.[0] && item.fields.subtitle[0].length > 0
                  ? `: ${item.fields.subtitle[0]}`
                  : ''}
              </a>
            </h3>
            <div>
              <div className="vf-summary__text">
                {formatDesc(item.fields.description[0])}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="vf-grid vf-grid__col-1">
        <div className="vf-content vf-u-background-color--grey--lightest vf-u-padding--400">
          <p className="vf-text vf-text--error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div id="training-tabs" className="vf-tabs">
        <ul className="vf-tabs__list" role="tablist">
          <li className="vf-tabs__item" role="presentation">
            <a
              className={`vf-tabs__link ${
                activeTab === 'training__section--1' ? 'is-active' : ''
              }`}
              href="#training__section--1"
              onClick={(e) => handleTabClick(e, 'training__section--1')}
              role="tab"
              aria-selected={activeTab === 'training__section--1'}
              aria-controls="training__section--1"
            >
              On-demand training
            </a>
          </li>
          <li className="vf-tabs__item" role="presentation">
            <a
              className={`vf-tabs__link ${
                activeTab === 'training__section--2' ? 'is-active' : ''
              }`}
              href="#training__section--2"
              onClick={(e) => handleTabClick(e, 'training__section--2')}
              role="tab"
              aria-selected={activeTab === 'training__section--2'}
              aria-controls="training__section--2"
            >
              Live training
            </a>
          </li>
        </ul>
      </div>
      <div className="vf-tabs-content">
        <section
          className="vf-tabs__section"
          id="training__section--1"
          role="tabpanel"
          aria-labelledby="training__section--1"
          style={{
            display: activeTab === 'training__section--1' ? 'block' : 'none',
          }}
        >
          {renderOnDemandContent()}
          <a
            id="view-all-on-demand-training-link"
            href="https://www.ebi.ac.uk/training/services/mgnify/on-demand"
            className="vf-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View all on-demand training{' '}
            <i className="icon icon-common icon-external-link-alt" />
          </a>
        </section>
        <section
          className="vf-tabs__section"
          id="training__section--2"
          role="tabpanel"
          aria-labelledby="training__section--2"
          style={{
            display: activeTab === 'training__section--2' ? 'block' : 'none',
          }}
        >
          {renderLiveContent()}
          <a
            href="https://www.ebi.ac.uk/training/services/mgnify/live-events"
            className="vf-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View all live training{' '}
            <i className="icon icon-common icon-external-link-alt" />
          </a>
        </section>
      </div>
    </div>
  );
};

export default TrainingCourses;
