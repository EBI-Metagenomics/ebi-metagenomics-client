import React, { useContext } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import InnerCard from 'components/UI/InnerCard';
import useBlogData from 'hooks/data/useBlogData';

import UserContext from 'pages/Login/UserContext';
import Twitter from 'components/Twitter';

const removeHTMLTags = (text: string): string => {
  return text.replace(/&lt;.+?&gt;/g, '').trim();
};
const absolutifyProtocolRelativeURL = (
  url: string,
  upgradeHttps = false
): string => {
  // Fix URLs for Safari.
  if (url.startsWith('//')) {
    return (upgradeHttps ? 'https:' : window.location.protocol) + url;
  }
  return url;
};
const BlogExcerpt: React.FC<{
  title: string;
  header: string;
  image?: string;
  excerpt: string;
  url: string;
}> = ({ title, header, image, excerpt, url }) => {
  return (
    <InnerCard
      image={absolutifyProtocolRelativeURL(image, true)}
      title={header}
      label={removeHTMLTags(excerpt)}
      to={absolutifyProtocolRelativeURL(url, true)}
      externalLink
      className="vf-card--striped vf-u-grid__col--span-3--xs vf-u-grid__col--span-1--md"
      badge={title}
    />
  );
};

const BlogExcerpts: React.FC = () => {
  const { data, loading, error } = useBlogData('feed-first-of-each.json');
  const { config } = useContext(UserContext);

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  const blogClass =
    'vf-grid vf-grid__col-3 | vf-card-container | ' +
    'vf-u-fullbleed vf-u-background-color-ui--grey--light';
  const twitterClass =
    'vf-card vf-card--brand vf-card--bordered ' +
    'vf-u-grid__col--span-3--xs vf-u-grid__col--span-1--md';
  return (
    <div>
      <div className={blogClass}>
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
        <article className={twitterClass}>
          <Twitter />
        </article>
        <div
          className="vf-grid__col--span-2 mg-right"
          style={{ marginTop: '0.2em' }}
        >
          <a href={config.blog} className="vf-button vf-button--primary">
            View all articles
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogExcerpts;
