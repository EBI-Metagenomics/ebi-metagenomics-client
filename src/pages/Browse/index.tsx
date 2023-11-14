import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import BrowseStudies from 'components/Browse/Studies';
import BrowseSuperStudies from 'components/Browse/SuperStudies';
import BrowseSamples from 'components/Browse/Samples';
import BrowsePublications from 'components/Browse/Publications';
import BrowseGenomes from 'components/Browse/Genomes';
import BrowseBiomes from 'components/Browse/Biomes';
import Tabs from 'components/UI/Tabs';
import Breadcrumbs from 'components/Nav/Breadcrumbs';

const tabs = [
  { label: 'Super Studies', to: '/browse/super-studies' },
  { label: 'Studies', to: '/browse/studies' },
  { label: 'Samples', to: '/browse/samples' },
  { label: 'Publications', to: '/browse/publications' },
  { label: 'Genomes', to: '/browse/genomes' },
  { label: 'Biomes', to: '/browse/biomes' },
];

const Browse: React.FC = () => {
  const breadcrumbs = [
    { url: '/metagenomics', label: 'Home' },
    { label: 'Browse', url: '/browse' },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Browse MGnify</h2>
      <Tabs tabs={tabs} />
      <div className="vf-u-padding__top--600">
        <Routes>
          <Route path="super-studies" element={<BrowseSuperStudies />} />
          <Route path="studies" element={<BrowseStudies />} />
          <Route path="samples" element={<BrowseSamples />} />
          <Route path="publications" element={<BrowsePublications />} />
          <Route path="genomes" element={<BrowseGenomes />} />
          <Route path="biomes" element={<BrowseBiomes />} />
          <Route index element={<Navigate to="super-studies" replace />} />
        </Routes>
      </div>
    </section>
  );
};

export default Browse;
