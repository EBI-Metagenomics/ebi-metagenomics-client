import React from 'react';

import './style.css';

export const PipelineChart1: React.FC = () => (
  <div className="block_wrapper">
    <div className="block_container">
      <div className="mainbranch">
        <div className="block-lb">Raw reads</div>
        <div className="arrow_pip " />
        <div className="block small step0">SeqPrep</div>
        <div className="arrow_pip " />
        <div className="block-lb">Initial reads</div>
        <div className="arrow_pip" />
        <div className="block step1">
          QC
          <div className="qclist">
            <ul>
              <li>Trim low quality (Trimmomatic)</li>
              <li>Length filtering (Biopython)</li>
              <li>Duplicate Removal (UCLUST &amp; Prefix)</li>
              <li>Filtering low complexity region (RepeatMasker)</li>
            </ul>
          </div>
        </div>
        <div className="arrow_pip" />
        <div className="block-lb">Processed reads</div>
        <div className="arrow_pip" />
        <div className="block step2">rRNASelector</div>
      </div>

      <div className="branch">
        <div className="branch1">
          <div className="arrow_pip rotate_f" />
          <div className="block-lb">Reads without rRNA</div>
          <div className="arrow_pip" />
          <div className="block step3 function">FragGeneScan</div>
          <div className="arrow_pip" />
          <div className="block-lb">Predicted CDS</div>
          <div className="arrow_pip" />
          <div className="block step4 function">InterProScan</div>
          <div className="block-nt">Functional analysis</div>
        </div>

        <div className="branch2">
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with rRNA</div>
          <div className="arrow_pip" />
          <div className="block-lb">16s rRNA</div>
          <div className="arrow_pip" />
          <div className="block step5 taxon">QIIME</div>
          <div className="block-nt">Taxonomic analysis</div>
        </div>
      </div>
    </div>
  </div>
);

export const PipelineChart2: React.FC = () => <div>PlaceHolder</div>;
