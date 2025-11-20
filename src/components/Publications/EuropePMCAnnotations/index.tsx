import React, { useState } from 'react';
import ExtLink from 'components/UI/ExtLink';
import EuropePMCLogo from 'images/europe_pmc_logo.png';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';

import './style.css';
import Accordion, {
  AccordionContentPanel,
  AccordionList,
} from 'components/UI/Accordion';
import EMGModal from 'components/UI/EMGModal';
import { usePublicationAnnotations } from 'hooks/data/usePublicationDetail';
import { AnnotationGroup } from '@/interfaces';

const AnnotationSuperGroup: React.FC<{
  superGroup: AnnotationGroup[];
  title: string;
}> = ({ superGroup, title }) => {
  return (
    <>
      <h3>{title}</h3>
      {!superGroup.length && <p>No {title} annotations</p>}
      <Accordion titles={superGroup.map((g) => g.title)}>
        {superGroup.map((g) => (
          <React.Fragment key={g.title}>
            <div style={{ padding: '0 8px' }}>
              <p className="vf-text text-body--5">
                <span className="icon icon-common icon-info" data-icon="i" />
                &nbsp; {g.description}
              </p>
            </div>
            <AccordionList
              titles={g.annotations.map((anno) => anno.annotation_text)}
              nestedLevel={2}
            >
              {g.annotations.map((anno) => (
                <React.Fragment key={anno.annotation_text}>
                  {anno.mentions.map((mention) => {
                    const hasFullText = !!mention.section;
                    // Some articles do not have section/context info due to licensing
                    return (
                      <AccordionContentPanel key={mention.id}>
                        <div className="publication-epmc-mention">
                          <div className="vf-sidebar vf-sidebar--end">
                            <div className="vf-sidebar__inner">
                              <div>
                                {hasFullText && (
                                  <p>
                                    Mentioned in the{' '}
                                    {mention.section.split(' (')[0]} section:
                                  </p>
                                )}
                              </div>
                              <div>
                                {hasFullText && (
                                  <ExtLink href={mention.id}>
                                    View on Europe PMC
                                  </ExtLink>
                                )}
                                &nbsp;&nbsp;
                                {mention.tags.map((tag) => (
                                  <ExtLink href={tag.uri} key={tag.name}>
                                    Definition of ‘{tag.name}’&nbsp;&nbsp;
                                  </ExtLink>
                                ))}
                              </div>
                            </div>
                          </div>
                          {hasFullText && (
                            <p>
                              <span className="publications-epmc-annotation-prefix">
                                &hellip;{mention.prefix}
                              </span>
                              <span className="publications-epmc-annotation-match">
                                <ExtLink href={mention.id}>
                                  {mention.exact}
                                </ExtLink>
                              </span>
                              <span className="publications-epmc-annotation-prefix">
                                {mention.postfix}&hellip;
                              </span>
                            </p>
                          )}
                          {!hasFullText && (
                            <p>
                              <span className="publications-epmc-annotation-prefix">
                                Full-text context of annotations is not
                                available for this article.
                              </span>
                            </p>
                          )}
                        </div>
                      </AccordionContentPanel>
                    );
                  })}
                </React.Fragment>
              ))}
            </AccordionList>
          </React.Fragment>
        ))}
      </Accordion>
    </>
  );
};
type PublicationAnnotationProps = {
  pubmedId: string;
};

const PublicationAnnotations: React.FC<PublicationAnnotationProps> = ({
  pubmedId,
}) => {
  const {
    data: annotations,
    loading,
    error,
  } = usePublicationAnnotations(parseInt(pubmedId, 10));
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;

  const hasAnnotations = !!(
    annotations?.sample_processing?.length || annotations?.other?.length
  );

  return (
    <div className="vf-stack vf-stack--400">
      <div style={{ width: '100%', textAlign: 'right' }}>
        Powered by <a href="https://europepmc.org">Europe PMC</a>.
        <img
          src={EuropePMCLogo}
          style={{ height: '2em' }}
          alt="Europe PMC logo"
        />
      </div>
      <p>
        Through automated text-mining, many publications may have additional
        metadata available in the form of{' '}
        <ExtLink href="https://europepmc.org/Annotations">Annotations</ExtLink>{' '}
        from <ExtLink href="https://europepmc.org">Europe PMC</ExtLink>. Any
        Metagenomics-relevant annotations are shown here.
      </p>
      {!hasAnnotations && (
        <p>
          No metagenomics annotations were found on Europe PMC. Annotations from
          other providers might be available on the{' '}
          <ExtLink href={`https://europepmc.org/abstract/MED/${pubmedId}`}>
            Europe PMC website
          </ExtLink>
          .
        </p>
      )}
      {hasAnnotations && (
        <>
          <AnnotationSuperGroup
            superGroup={annotations.sample_processing}
            title="Sample processing"
          />
          <AnnotationSuperGroup superGroup={annotations.other} title="Other" />
        </>
      )}
    </div>
  );
};

export const PublicationAnnotationsPopupBadge: React.FC<
  PublicationAnnotationProps
> = ({ pubmedId }) => {
  const {
    data: annotations,
    loading,
    error,
  } = usePublicationAnnotations(parseInt(pubmedId, 10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (loading) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;

  const hasAnnotations = !!(
    annotations?.sample_processing?.length || annotations?.other?.length
  );
  if (!hasAnnotations) return null;
  return (
    <>
      <EMGModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel={`Europe PMC Annotations for ${pubmedId}`}
      >
        <h1>Annotations from Europe PMC</h1>
        <PublicationAnnotations pubmedId={pubmedId} />
      </EMGModal>
      <button
        className="vf-button vf-button--link vf-button--sm"
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="vf-badge vf-badge--secondary">
          <i className="icon icon-common" data-icon="&#xf1c0;" /> meta
        </span>
        &nbsp;&nbsp; Show metadata from Europe PMC Annotations
      </button>
    </>
  );
};

export default PublicationAnnotations;
