/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import BrowseStudies from 'components/Browse/Studies';
import BrowseSuperStudies from 'components/Browse/SuperStudies';
import BrowseSamples from 'components/Browse/Samples';
import BrowsePublications from 'components/Browse/Publications';
import BrowseGenomes from 'components/Browse/Genomes';
import Tabs from 'components/UI/Tabs';

const tabs = [
  { label: 'Super Studies', to: '/browse/super-studies' },
  { label: 'Studies', to: '/browse/studies' },
  { label: 'Samples', to: '/browse/samples' },
  { label: 'Publications', to: '/browse/publications' },
  { label: 'Genomes', to: '/browse/genomes' },
];

const Browse: React.FC = () => {
  return (
    <section className="vf-content">
      <h2>Browse Page.</h2>
      <Tabs tabs={tabs} />
      <Switch>
        <Route path="/browse/super-studies">
          <BrowseSuperStudies />
        </Route>
        <Route path="/browse/studies">
          <BrowseStudies />
        </Route>
        <Route path="/browse/samples">
          <BrowseSamples />
        </Route>
        <Route path="/browse/publications">
          <BrowsePublications />
        </Route>
        <Route path="/browse/genomes">
          <BrowseGenomes />
        </Route>
        <Route>
          <Redirect to="/browse/super-studies" />
        </Route>
      </Switch>
    </section>
  );
};

export default Browse;
