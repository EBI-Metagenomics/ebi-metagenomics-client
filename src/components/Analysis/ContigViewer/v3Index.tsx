import React, { useEffect, useMemo, useState } from 'react';
// import { createViewState, JBrowseApp } from '@jbrowse/react-app';
// import { createRoot } from 'react-dom/client';
// eslint-disable-next-line import/no-relative-packages
// import Jcv from '../../../../../../../sandbox/jbrowse2_poc/src/Jcv';
// import Jcv from '/Users/mahfouz/Code/sandbox/mgnify_jbrowse2/src/Jcv';
// import Jcv from './Jcv';
// Using ES6 imports
import { JBrowseContigViewer } from 'mgnify-jbrowse';

// Or using CommonJS
// const { JBrowseContigViewer } = require('mgnify-jbrowse');

const ContigViewer = () => {
  return (
    <JBrowseContigViewer
      // <Jcv
      genomeMeta={{
        id: 1,
        species: 'ERZ1049444',
        isolate_name: 'ERZ1049444',
        assembly_name: 'ERZ1049444',
        assembly_accession: 'ERZ1049444.1',
        fasta_file: 'ERZ1049444.fasta',
        gff_file: 'ERZ1049444.gff3',
        fasta_url: 'http://localhost:8080/ERZ1049444/ERZ1049444.fasta',
        gff_url: 'http://localhost:8080/ERZ1049444/ERZ1049444.gff3',
        type_strain: true,
      }}
      fileLocations={{
        fasta:
          'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_FASTA.fasta.gz',
        fai: 'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_FASTA.fasta.gz.fai',
        gzi: 'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_FASTA.fasta.gz.gzi',
      }}
    />
  );
};

export default ContigViewer;
