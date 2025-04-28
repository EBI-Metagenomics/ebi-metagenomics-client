import React, { useEffect, useMemo, useState } from 'react';
import { createViewState, JBrowseApp } from '@jbrowse/react-app';
import { createRoot } from 'react-dom/client';

type ViewModel = ReturnType<typeof createViewState>;

interface GenomeMeta {
  id: number;
  species: string;
  isolate_name: string;
  assembly_name: string;
  assembly_accession: string | null;
  fasta_file: string;
  gff_file: string;
  fasta_url: string;
  gff_url: string;
  type_strain: boolean;
}

const getDefaultSessionConfig = (
  genomeMeta: GenomeMeta | null,
  assembly: any,
  tracks: any[]
) => {
  if (!genomeMeta) {
    console.log('Genome meta information not found');
    return null;
  }

  return {
    name: 'New session',
    views: [
      {
        type: 'LinearGenomeView',
        displayedRegions: [
          {
            refName: 'ERZ1049444.1-NODE-1-length-411323-cov-24.763004',
            start: 0,
            end: 400000, // dynamically change it to length of contig we want to show
            assemblyName: genomeMeta.assembly_name,
          },
        ],
        tracks: [
          {
            type: 'ReferenceSequenceTrack',
            configuration: 'ReferenceSequenceTrack',
            minimized: false,
            displays: [
              {
                id: 'ReferenceSequenceTrack',
                type: 'LinearReferenceSequenceDisplay',
                height: 280,
                showForward: true,
                showReverse: true,
                showTranslation: true,
                showLabels: true,
              },
            ],
          },
          {
            type: 'FeatureTrack',
            configuration: 'structural_annotation',
            displays: [
              {
                id: 'structural_annotation-LinearBasicDisplay',
                type: 'LinearBasicDisplay',
                rendererTypeName: 'SvgFeatureRenderer',
                renderer: {
                  type: 'SvgFeatureRenderer',
                },
                height: 280,
              },
            ],
          },
        ],
      },
    ],
  };
};

const getTracks = (genomeMeta: GenomeMeta, gffBaseUrl: string) => {
  const tracks = [];

  // Structural Annotation Track
  tracks.push({
    type: 'FeatureTrack',
    trackId: 'structural_annotation',
    name: 'structural_annotation',
    assemblyNames: [genomeMeta.assembly_name],
    category: ['Annotations'],
    adapter: {
      type: 'Gff3TabixAdapter',
      gffGzLocation: {
        // uri: 'http://localhost:8080/ERZ1049444/ERZ1049444_FASTA_annotations.gff.bgz',
        uri: 'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_FASTA_annotations.gff.bgz',
      },
      index: {
        location: {
          // uri: 'http://localhost:8080/ERZ1049444/ERZ1049444_FASTA_annotations.gff.bgz.tbi',
          uri: 'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_FASTA_annotations.gff.bgz.tbi',
        },
      },
    },
    textSearching: {
      textSearchAdapter: {
        type: 'TrixTextSearchAdapter',
        textSearchAdapterId: 'gff3tabix_genes-index',
        trackId: 'structural_annotation',
        ixFilePath: {
          uri: 'http://localhost:8080/ERZ1049444/trix/ERZ1049444_FASTA_annotations.gff.bgz.ix',
        },
        ixxFilePath: {
          uri: 'http://localhost:8080/ERZ1049444/trix/ERZ1049444_FASTA_annotations.gff.bgz.ixx',
        },
        metaFilePath: {
          uri: 'http://localhost:8080/ERZ1049444/trix/ERZ1049444_FASTA_annotations.gff.bgz_meta.json',
        },
        assemblyNames: [genomeMeta.assembly_name],
      },
    },
    displays: [
      {
        displayId: 'customTrack-LinearBasicDisplay',
        type: 'LinearBasicDisplay',
        rendererTypeName: 'SvgFeatureRenderer',
        renderer: {
          type: 'SvgFeatureRenderer',
        },
        height: 280,
      },
    ],
    visible: true,
  });

  return tracks;
};
// dummy object
const genomeMeta: GenomeMeta = {
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
};

const getAssembly = (gm: GenomeMeta, fastaBaseUrl: string) => ({
  name: gm.assembly_name,
  sequence: {
    type: 'ReferenceSequenceTrack',
    trackId: 'ReferenceSequenceTrack',
    adapter: {
      type: 'BgzipFastaAdapter',
      fastaLocation: {
        // uri: 'http://localhost:8080/ERZ1049444/ERZ1049444_FASTA.fasta.gz',
        uri: 'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_FASTA.fasta.gz',
      },
      faiLocation: {
        // uri: 'http://localhost:8080/ERZ1049444/ERZ1049444_FASTA.fasta.gz.fai',
        uri: 'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_FASTA.fasta.gz.fai',
      },
      gziLocation: {
        // uri: 'http://localhost:8080/ERZ1049444/ERZ1049444_FASTA.fasta.gz.gzi',
        uri: 'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/ERZ1049444_FASTA.fasta.gz.gzi',
      },
    },
  },
});

function View() {
  const [viewState, setViewState] = useState<ViewModel | null>(null);

  const assembly = useMemo(() => {
    return getAssembly(
      genomeMeta,
      process.env.REACT_APP_ASSEMBLY_INDEXES_PATH || ''
    );
  }, []);

  const tracks = useMemo(() => {
    return getTracks(genomeMeta, process.env.REACT_APP_GFF_INDEXES_PATH || '');
  }, []);

  const sessionConfig = useMemo(() => {
    return getDefaultSessionConfig(genomeMeta, assembly, tracks);
  }, [assembly, tracks]);

  const config = useMemo(
    () => ({
      assemblies: [assembly],
      tracks: tracks.map((track) => ({
        ...track,
        visible: true,
      })),
      defaultSession: sessionConfig
        ? { ...sessionConfig, name: 'defaultSession' }
        : undefined,
    }),
    [assembly, tracks, sessionConfig]
  );

  useEffect(() => {
    console.log('Initializing JBrowse');
    // const state = createViewState({
    //   config,
    //   createRootFn: createRoot,
    // });
    // setViewState(state);
  }, [config]);

  if (!viewState) {
    return null;
  }

  return (
    <>
      <h1>JBrowse 2 - Loading Large Metagenomes</h1>
      <div style={{ height: '100px' }}>
        <JBrowseApp viewState={viewState} />
      </div>
    </>
  );
}

export default View;
