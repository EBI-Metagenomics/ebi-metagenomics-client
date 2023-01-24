import React from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';

import './style.css';

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
