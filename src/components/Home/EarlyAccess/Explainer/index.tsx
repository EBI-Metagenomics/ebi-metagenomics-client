import React from 'react';
import ExtLink from 'components/UI/ExtLink';

const EarlyAccessExplainer: React.FC = () => {
  return (
    <section className="vf-stack vf-stack--200">
      <h1 className="vf-text vf-text--heading-l">The MGnify V6 Pipelines</h1>
      <p>
        Version 6 of MGnify’s analysis pipelines for microbiome-derived datasets
        were released in early 2025, and replace Version 5.
      </p>
      <p>
        Notable changes include:
        <ul className="vf-list vf-list--unordered vf-list--l">
          <li className="vf-list__item">
            Updated versions of the taxonomic and functional reference databases
            used.
          </li>
          <li className="vf-list__item">
            Addition of Amplicon Sequence Variants (ASVs) to the Amplicon
            analysis pipeline, which complement the closed-reference taxonomic
            assignments available in this and previous pipeline versions.
          </li>
          <li className="vf-list__item">
            Addition of virome and mobilome annotations to metagenome assembly
            analyses.
          </li>
          <li className="vf-list__item">
            More robust taxonomic assignments in assemblies, using a
            protein-based approach instead of marker genes.
          </li>
        </ul>
      </p>
      <p>
        All of the V6 analysis pipelines have been written in{' '}
        <ExtLink href="https://www.nextflow.io/">Nextflow</ExtLink> and are
        available from the{' '}
        <ExtLink href="https://github.com/ebi-metagenomics/#pipelines">
          EBI-Metagenomics GitHub
        </ExtLink>
        , so may be freely used elsewhere.
      </p>
      <h1 className="vf-text vf-text--heading-l">Early Data Release</h1>
      <p>
        The datasets available in this Early Data Release are the first
        metagenomic studies to be analysed with MGnify V6. Annotations in these
        analyses are subject to revision, if any bugs are found which materially
        change the results. Study (MGYS) and Analysis (MGYA) accessions are
        stable and will always refer to the same ENA study and a V6 analysis of
        the same ENA run/assembly, respectively.
      </p>
      <p>
        For more information, or to provide feedback or bug reports, please{' '}
        <a href="//www.ebi.ac.uk/about/contact" className="vf-list__link">
          contact us
        </a>
        .
      </p>
    </section>
  );
};

export default EarlyAccessExplainer;
