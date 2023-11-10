import React, { ReactChild, ReactChildren, useState } from 'react';
import { Link } from 'react-router-dom';

import CoverImage from 'images/cover_main_publication.png';
import publications from './publications.json';

import './style.css';

const trimAuthors = (text: string, maxAuthorsLength: number): string => {
  const authorList = text.slice(0, maxAuthorsLength).split(',');
  authorList.pop();
  authorList.push(' et al.');
  return authorList.join(',');
};

export const Publication: React.FC<{
  id?: string;
  title: string;
  journal: string;
  year: number;
  link: string;
  doi: string;
  authors: string;
  maxAuthorsLength?: number;
  children?: ReactChild | ReactChildren;
}> = ({
  id,
  title,
  journal,
  year,
  link,
  doi,
  authors,
  maxAuthorsLength,
  children,
}) => {
  const trimmedAuthors =
    maxAuthorsLength && authors.length > maxAuthorsLength
      ? trimAuthors(authors, maxAuthorsLength)
      : authors;
  const titleLink = id ? (
    <Link to={`/publications/${id}`}>{title}</Link>
  ) : (
    <a href={link}>{title}</a>
  );
  return (
    <section className="mg-pub">
      <span className="mg-pub-title">{titleLink}</span>{' '}
      <span className="mg-pub-journal">{journal}</span> (
      <span className="mg-pub-year">{year}</span>){' '}
      <span className="mg-pub-doi">
        doi:
        <a title={title} href={link} className="mg-ext">
          {doi}
        </a>
      </span>
      <div className="mg-pub-authors">{trimmedAuthors}.</div>
      {children}
    </section>
  );
};
export const MainPublicationForResource: React.FC<{
  resource: string;
  citationPretext: string;
}> = ({ resource, citationPretext }) => {
  const publication = publications.filter(
    (pub) => pub.isMainCitationFor && pub.isMainCitationFor.includes(resource)
  )?.[0];
  return (
    <div className="mg-main-pub-resource">
      {publication && (
        <>
          <p className="vf-text-body vf-text-body--3">{citationPretext}</p>
          <Publication
            id={publication.id}
            title={publication.title}
            journal={publication.journal}
            year={publication.year}
            link={publication.link}
            doi={publication.doi}
            authors={publication.authors}
          />
        </>
      )}
    </div>
  );
};
export const MainPublication: React.FC = () => {
  return (
    <div className="embl-grid | vf-content">
      <div className="vf-section-header mg-pub-section-header">
        <img
          alt="Cover of the journal"
          src={CoverImage}
          className="mg-pub-cover"
        />
      </div>
      <div>
        <MainPublicationForResource
          resource="mgnify"
          citationPretext="To cite MGnify, please refer to the following publication:"
        />
      </div>
    </div>
  );
};
const Publications: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  return (
    <section className="mg-pub-section">
      {publications
        .filter((pub) => showMore || pub.recent)
        .map((pub) => (
          <article key={pub.doi}>
            <Publication
              id={pub.id}
              title={pub.title}
              journal={pub.journal}
              year={pub.year}
              link={pub.link}
              doi={pub.doi}
              authors={pub.authors}
            />
          </article>
        ))}
      <div className="mg-right">
        <button
          type="button"
          className="vf-button vf-button--sm"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? 'Less' : 'More'} publications
        </button>
      </div>
    </section>
  );
};

export default Publications;
