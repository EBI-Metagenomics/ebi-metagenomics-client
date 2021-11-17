/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

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
  const loc = useLocation();
  console.log(loc);
  return (
    <section className="vf-content">
      <h2>Browse Page.</h2>
      <Tabs tabs={tabs} />
      <Routes>
        <Route path="super-studies" element={<BrowseSuperStudies />} />
        <Route path="studies" element={<BrowseStudies />} />
        <Route path="samples" element={<BrowseSamples />} />
        <Route path="publications" element={<BrowsePublications />} />
        <Route path="genomes" element={<BrowseGenomes />} />
        <Route index element={<Navigate to="super-studies" replace />} />
      </Routes>
    </section>
  );
};

export default Browse;
