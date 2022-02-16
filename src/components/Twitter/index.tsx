import React from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';

import './style.css';

export const TwitterHandle: React.FC = () => (
  <div className="mg-right vf-text-body vf-text-body--1">
    <a
      href="https://twitter.com/MgnifyDB"
      target="_blank"
      rel="noreferrer noopener"
      title="link to our twitter"
      style={{
        color: 'rgb(63, 136, 222)',
      }}
    >
      <span className="icon icon-common icon-twitter" /> @MGnifyDB
    </a>
  </div>
);

const Twitter: React.FC = () => (
  <div className="mg-twitter-timeline">
    <div>
      <TwitterTimelineEmbed
        sourceType="profile"
        screenName="MGnifyDB"
        options={{ height: 480, width: 480 }}
      />
    </div>
  </div>
);

export default Twitter;
