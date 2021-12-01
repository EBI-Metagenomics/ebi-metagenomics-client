import React from 'react';

import AmpliconImg from 'images/pipeline/version_5/pipeline_v5.0_amplicon.png';
import AssemblyImg from 'images/pipeline/version_5/pipeline_v5.0_assembly.png';
import RawImg from 'images/pipeline/version_5/pipeline_v5.0_raw.png';

import './style.css';
import Tabs from 'src/components/UI/Tabs';
import RouteForHash from 'src/components/Nav/RouteForHash';

type TableProps = {
  onHoverStep?: (step: number) => void;
};

export const PipelineChart1: React.FC<TableProps> = ({
  onHoverStep = () => null,
}) => (
  <div className="block_wrapper">
    <div className="block_container">
      <div className="mainbranch">
        <div className="block-lb">Raw reads</div>
        <div className="arrow_pip " />
        <div
          className="block small step0"
          onMouseOver={() => onHoverStep(0)}
          onFocus={() => onHoverStep(0)}
        >
          SeqPrep
        </div>
        <div className="arrow_pip " />
        <div className="block-lb">Initial reads</div>
        <div className="arrow_pip" />
        <div
          className="block step1"
          onMouseOver={() => onHoverStep(1)}
          onFocus={() => onHoverStep(1)}
        >
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
        <div
          className="block step2"
          onMouseOver={() => onHoverStep(2)}
          onFocus={() => onHoverStep(2)}
        >
          rRNASelector
        </div>
      </div>

      <div className="branch">
        <div className="branch1">
          <div className="arrow_pip rotate_f" />
          <div className="block-lb">Reads without rRNA</div>
          <div className="arrow_pip" />
          <div
            className="block step3 function"
            onMouseOver={() => onHoverStep(3)}
            onFocus={() => onHoverStep(3)}
          >
            FragGeneScan
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">Predicted CDS</div>
          <div className="arrow_pip" />
          <div
            className="block step4 function"
            onMouseOver={() => onHoverStep(4)}
            onFocus={() => onHoverStep(4)}
          >
            InterProScan
          </div>
          <div className="block-nt">Functional analysis</div>
        </div>

        <div className="branch2">
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with rRNA</div>
          <div className="arrow_pip" />
          <div className="block-lb">16s rRNA</div>
          <div className="arrow_pip" />
          <div
            className="block step5 taxon"
            onMouseOver={() => onHoverStep(5)}
            onFocus={() => onHoverStep(5)}
          >
            QIIME
          </div>
          <div className="block-nt">Taxonomic analysis</div>
        </div>
      </div>
    </div>
  </div>
);

export const PipelineChart2: React.FC<TableProps> = ({
  onHoverStep = () => null,
}) => (
  <div className="block_wrapper">
    <div className="block_container">
      <div className="mainbranch">
        <div className="block-lb">Raw reads</div>
        <div className="arrow_pip " />
        <div
          className="block small step0"
          onMouseOver={() => onHoverStep(0)}
          onFocus={() => onHoverStep(0)}
        >
          SeqPrep
        </div>
        <div className="arrow_pip " />
        <div className="block-lb">Initial reads</div>
        <div className="arrow_pip" />
        <div
          className="block step1"
          onMouseOver={() => onHoverStep(1)}
          onFocus={() => onHoverStep(1)}
        >
          QC
          <div className="qclist">
            <ul>
              <li>Trim low quality (Trimmomatic)</li>
              <li>Length filtering (Biopython)</li>
            </ul>
          </div>
        </div>
        <div className="arrow_pip" />
        <div className="block-lb">Processed reads</div>
        <div className="arrow_pip" />
        <div
          className="block step2"
          onMouseOver={() => onHoverStep(2)}
          onFocus={() => onHoverStep(2)}
        >
          rRNASelector
        </div>
      </div>

      <div className="branch">
        <div className="branch1">
          <div className="arrow_pip rotate_f" />
          <div className="block-lb">Reads with rRNA masked</div>
          <div className="arrow_pip" />
          <div
            className="block step3 function"
            onMouseOver={() => onHoverStep(3)}
            onFocus={() => onHoverStep(3)}
          >
            FragGeneScan
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">Predicted CDS</div>
          <div className="arrow_pip" />
          <div
            className="block step4 function"
            onMouseOver={() => onHoverStep(4)}
            onFocus={() => onHoverStep(4)}
          >
            InterProScan
          </div>
          <div className="block-nt">Functional analysis</div>
        </div>

        <div className="branch2">
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with rRNA</div>
          <div className="arrow_pip" />
          <div className="block-lb">16s rRNA</div>
          <div className="arrow_pip" />
          <div
            className="block step5 taxon"
            onMouseOver={() => onHoverStep(5)}
            onFocus={() => onHoverStep(5)}
          >
            QIIME
          </div>
          <div className="block-nt">Taxonomic analysis</div>
        </div>
      </div>
    </div>
  </div>
);
export const PipelineChart3: React.FC<TableProps> = ({
  onHoverStep = () => null,
}) => (
  <div className="block_wrapper">
    <div className="block_container pipe_v3">
      <div className="mainbranch">
        <div className="block-lb">Raw reads</div>
        <div className="arrow_pip " />
        <div
          className="block small step0"
          onMouseOver={() => onHoverStep(0)}
          onFocus={() => onHoverStep(0)}
        >
          <div className="children">SeqPrep</div>
        </div>
        <div className="arrow_pip " />
        <div className="block-lb">Initial reads</div>
        <div className="arrow_pip" />
        <div
          className="block step1"
          onMouseOver={() => onHoverStep(1)}
          onFocus={() => onHoverStep(1)}
        >
          <div className="children">QC</div>
        </div>
        <div className="arrow_pip" />
        <div className="block-lb">Processed reads</div>
        <div className="arrow_pip" />
        <div
          className="block step2"
          onMouseOver={() => onHoverStep(2)}
          onFocus={() => onHoverStep(2)}
        >
          <div className="children_l">ncRNA selection</div>
        </div>
      </div>

      <div className="lowbranch">
        <div className="lowbranch_func">
          <div className="arrow_pip rotate_f" />
          <div className="block-lb">Reads with rRNA &amp; tRNA masked</div>
          <div className="arrow_pip" />
          <div
            className="block step3 function"
            onMouseOver={() => onHoverStep(3)}
            onFocus={() => onHoverStep(3)}
          >
            <div className="children_l">ORF predictions</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">Predicted CDS</div>
          <div className="arrow_pip" />
          <div
            className="block step4 function"
            onMouseOver={() => onHoverStep(4)}
            onFocus={() => onHoverStep(4)}
          >
            <div className="children_l">Functional analysis</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">IPR matches &amp; GO terms</div>
        </div>

        <div className="lowbranch_tax">
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with rRNA</div>
          <div className="arrow_pip" />
          <div className="block-lb">16s rRNA</div>
          <div className="arrow_pip" />
          <div
            className="block step5 taxon"
            onMouseOver={() => onHoverStep(5)}
            onFocus={() => onHoverStep(5)}
          >
            <div className="children_l">Taxonomic analysis</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">OTUs &amp; taxonomic lineage</div>
        </div>

        <div className="lowbranch_trna">
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with tRNA</div>
        </div>
      </div>
    </div>
  </div>
);
export const PipelineChart4: React.FC<TableProps> = ({
  onHoverStep = () => null,
}) => (
  <div className="block_wrapper">
    <div className="block_container pipe_v3">
      <div className="mainbranch">
        <div className="block-lb">Raw reads</div>
        <div className="arrow_pip " />
        <div
          className="block small step0"
          onMouseOver={() => onHoverStep(0)}
          onFocus={() => onHoverStep(0)}
        >
          <div className="children">SeqPrep</div>
        </div>
        <div className="arrow_pip " />
        <div className="block-lb">Initial reads</div>
        <div className="arrow_pip" />
        <div
          className="block step1"
          onMouseOver={() => onHoverStep(1)}
          onFocus={() => onHoverStep(1)}
        >
          <div className="children">QC</div>
        </div>
        <div className="arrow_pip" />
        <div className="block-lb">Processed reads</div>
        <div className="arrow_pip" />
        <div
          className="block step2"
          onMouseOver={() => onHoverStep(2)}
          onFocus={() => onHoverStep(2)}
        >
          <div className="children_l">ncRNA selection</div>
        </div>
      </div>

      <div className="lowbranch">
        <div className="lowbranch_func">
          <div className="arrow_pip rotate_f" />
          <div className="block-lb">Reads with ncRNA reads filtered out</div>
          <div className="arrow_pip" />
          <div
            className="block step3 function"
            onMouseOver={() => onHoverStep(3)}
            onFocus={() => onHoverStep(3)}
          >
            <div className="children_l">ORF predictions</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">Predicted CDS</div>
          <div className="arrow_pip" />
          <div
            className="block step4 function"
            onMouseOver={() => onHoverStep(4)}
            onFocus={() => onHoverStep(4)}
          >
            <div className="children_l">Functional analysis</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">IPR matches &amp; GO terms</div>
        </div>

        <div className="lowbranch_tax">
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with rRNA</div>
          <div className="arrow_pip" />
          <div className="block-lb">SSU/LSU rRNA</div>
          <div className="arrow_pip" />
          <div
            className="block step5 taxon"
            onMouseOver={() => onHoverStep(5)}
            onFocus={() => onHoverStep(5)}
          >
            <div className="children_l">Taxonomic analysis</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">OTUs &amp; taxonomic lineage</div>
        </div>

        <div className="lowbranch_trna">
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with tRNA</div>
        </div>
      </div>
    </div>
  </div>
);
export const PipelineChart41: React.FC<TableProps> = ({
  onHoverStep = () => null,
}) => (
  <div className="block_wrapper">
    <div className="block_container pipe_v3">
      <div className="mainbranch">
        <div className="block-lb">Raw reads</div>
        <div className="arrow_pip " />
        <div
          className="block small step0"
          onMouseOver={() => onHoverStep(0)}
          onFocus={() => onHoverStep(0)}
        >
          <div className="children">SeqPrep</div>
        </div>
        <div className="arrow_pip " />
        <div className="block-lb">Initial reads</div>
        <div className="arrow_pip" />
        <div
          className="block step1"
          onMouseOver={() => onHoverStep(1)}
          onFocus={() => onHoverStep(1)}
        >
          <div className="children">QC</div>
        </div>
        <div className="arrow_pip" />
        <div className="block-lb">Processed reads</div>
        <div className="arrow_pip" />
        <div
          className="block step2"
          onMouseOver={() => onHoverStep(2)}
          onFocus={() => onHoverStep(2)}
        >
          <div className="children_l">ncRNA selection</div>
        </div>
      </div>

      <div className="lowbranch">
        <div className="lowbranch_func">
          <div className="arrow_pip rotate_f" />
          <div className="block-lb">Reads with ncRNA reads filtered out</div>
          <div className="arrow_pip" />
          <div
            className="block step3 function"
            onMouseOver={() => onHoverStep(3)}
            onFocus={() => onHoverStep(3)}
          >
            <div className="children_l">ORF predictions</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">Predicted CDS</div>
          <div className="arrow_pip" />
          <div
            className="block step4 function"
            onMouseOver={() => onHoverStep(4)}
            onFocus={() => onHoverStep(4)}
          >
            <div className="children_l">Functional analysis</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">IPR matches &amp; GO terms</div>
        </div>

        <div className="lowbranch_tax">
          {' '}
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with rRNA</div>
          <div className="arrow_pip" />
          <div className="block-lb">SSU/LSU rRNA</div>
          <div className="arrow_pip" />
          <div
            className="block step5 taxon"
            onMouseOver={() => onHoverStep(5)}
            onFocus={() => onHoverStep(5)}
          >
            <div className="children_l">Taxonomic analysis</div>
          </div>
          <div className="arrow_pip" />
          <div className="block-lb">OTUs &amp; taxonomic lineage</div>
        </div>

        <div className="lowbranch_trna">
          <div className="arrow_pip rotate_t" />
          <div className="block-lb">Reads with tRNA</div>
        </div>
      </div>
    </div>
  </div>
);

const tabs = [
  { label: 'Amplicon', to: '#' },
  { label: 'Raw reads', to: '#raw' },
  { label: 'Assembly', to: '#assembly' },
];
export const PipelineChart5: React.FC = () => (
  <section>
    <p>
      This version of the MGnify analysis service offers specialised workflows
      for three different data types: amplicon, raw
      metagenomic/metatranscriptomic reads, and assembly.
    </p>
    <Tabs tabs={tabs} />

    <RouteForHash hash="" isDefault>
      <div>
        <h4>Amplicon analysis pipeline</h4>
        <img
          src={AmpliconImg}
          alt="Amplicon flow diagram"
          style={{ maxHeight: '60vh' }}
        />
      </div>
    </RouteForHash>
    <RouteForHash hash="#raw">
      <div>
        <h4>Raw reads analysis pipeline</h4>
        <img
          src={RawImg}
          alt="Raw reads flow diagram"
          style={{ maxHeight: '60vh' }}
        />
      </div>
    </RouteForHash>
    <RouteForHash hash="#assembly">
      <div>
        <h4>Assembly analysis pipeline</h4>
        <img
          src={AssemblyImg}
          alt="Assembly flow diagram"
          style={{ maxHeight: '60vh' }}
        />
      </div>
    </RouteForHash>
  </section>
);
