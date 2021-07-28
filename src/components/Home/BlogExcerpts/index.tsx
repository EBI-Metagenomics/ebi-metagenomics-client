import React from 'react';

import Loading from 'components/UI/Loading';
import InnerCard from 'components/UI/InnerCard';
import OutterCard from 'components/UI/OutterCard';
import { useBlogData } from 'hooks/useMGnifyData';

import config from 'config.json';

const removeHTMLTags = (text: string): string => {
  return text.replace(/&lt;.+?&gt;/g, '').trim();
};
const BlogExcerpt: React.FC<{
  title: string;
  header: string;
  image?: string;
  excerpt: string;
  url: string;
}> = ({ title, header, image, excerpt, url }) => {
  return (
    <OutterCard className="blog">
      <h3 className="vf-card__heading">{title}</h3>
      <InnerCard
        image={image}
        title={header}
        label={removeHTMLTags(excerpt)}
        to={url}
        externalLink
      />
    </OutterCard>
  );
};

const BlogExcerpts: React.FC = () => {
  const data = useBlogData('feed-first-of-each.json');
  if (!data) return <Loading size="large" />;
  return (
    <div>
      <div className="vf-grid">
        {data.spotlight && (
          <BlogExcerpt
            title="Spotlight"
            header={data.spotlight.title}
            image={data.spotlight.image}
            excerpt={data.spotlight.excerpt}
            url={data.spotlight.url}
          />
        )}
        {data.tools && (
          <BlogExcerpt
            title="Tools"
            header={data.tools.title}
            image={data.tools.image}
            excerpt={data.tools.excerpt}
            url={data.tools.url}
          />
        )}
      </div>
      <div className="mg-right" style={{ marginTop: '0.2em' }}>
        <a href={config.blog} className="vf-button vf-button--primary">
          View all articles
        </a>
      </div>
    </div>
  );
};

export default BlogExcerpts;
