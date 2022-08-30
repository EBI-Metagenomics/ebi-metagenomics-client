import React, { useEffect, useMemo, useState } from 'react';

import {
  db,
  encodeGFF,
} from 'components/Analysis/ContigViewer/GFFCompare/gff_db';
import { useLiveQuery } from 'dexie-react-hooks';

import './style.css';

import ArrowForLink from 'components/UI/ArrowForLink';
import PlainTable from 'components/UI/PlainTable';
import FileUploaderButton from 'components/UI/FileUploaderButton';
import { Browser } from 'igv';
import EMGModal from 'components/UI/EMGModal';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

type GFFCompareProps = {
  igvBrowser: Browser;
};

const getGFFHeaderValue = (encodedGff, varName) => {
  return atob(encodedGff).split(`${varName}=`)[1].split('\n')[0];
};

const colorScale = (number, max) => {
  return `rgba(0,128,128,${0.3 + (0.7 * number) / max})`;
};

const GFFCompare: React.FC<GFFCompareProps> = ({ igvBrowser }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [gffComparisonId, setGffComparisonId] = useQueryParamState(
    'gff_comparison_id',
    null,
    Number
  );

  const [colorBarMax, setColorBarMax] = useState(null);

  const gffs = useLiveQuery(() => db.gffs.toArray());

  useEffect(() => {
    if (gffComparisonId) {
      db.gffs.get(gffComparisonId).then((gff) => {
        if (gff === undefined) {
          setGffComparisonId(null);
        } else if (igvBrowser) {
          const parsedColorBarMax = parseFloat(
            getGFFHeaderValue(
              gff.encodedGFF,
              'max_spectrum_count_value_in_study'
            )
          );
          setColorBarMax(parsedColorBarMax);
          igvBrowser.removeTrackByName(gff.name);
          igvBrowser.loadTrack({
            name: gff.name,
            type: 'annotation',
            url: `data:application/octet-stream;base64,${gff.encodedGFF}`,
            format: 'gff3',
            filterTypes: [],
            removable: false,
            displayMode: 'EXPANDED',
            labelBy: 'pride_id',
            color: (feature) => {
              const colorBarNumber = parseFloat(
                feature.getAttributeValue(
                  'semiquantitative_expression_spectrum_count'
                )
              );
              return colorScale(colorBarNumber, parsedColorBarMax);
            },
          });
        }
      });
    }
  }, [gffComparisonId, igvBrowser, setGffComparisonId]);

  const columns = useMemo(() => {
    return [
      {
        id: 'name',
        Header: 'GFF Filename',
        accessor: (gff) => gff.name,
        Cell: ({ cell, row }) => (
          <button
            className="vf-button vf-button--link vf-button--sm contig-id-button"
            type="button"
            onClick={async () => {
              const gff = await db.gffs.get(row.original.id);
              setGffComparisonId(gff.id);
              setIsOpen(false);
            }}
          >
            {cell.value}
            <ArrowForLink />
          </button>
        ),
      },
      {
        id: 'size',
        Header: 'File size (Kb)',
        accessor: (gff) => gff.size,
        Cell: ({ cell }) => <span>{cell.value}</span>,
      },
      {
        id: 'added',
        Header: 'Added',
        accessor: (gff) => gff.added,
        Cell: ({ cell }) => <span>{cell.value?.toLocaleString()}</span>,
      },
      {
        id: 'del',
        Header: 'Remove',
        accessor: (gff) => gff.id,
        Cell: ({ cell }) => (
          <button
            className="vf-button vf-button--link vf-button--sm"
            type="button"
            onClick={() => db.gffs.delete(cell.value)}
          >
            Remove
          </button>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gffComparisonId]);

  async function addGff(gffFile): Promise<void> {
    if (!gffFile) return;
    const encoded = await encodeGFF(gffFile);
    try {
      await db.gffs.add({
        name: gffFile.name,
        size: gffFile.size,
        added: new Date(Date.now()),
        encodedGFF: encoded,
      });
      setUploadError(null);
    } catch (error) {
      setUploadError(`GFF upload error: ${error}`);
    }
  }

  return (
    <div>
      <EMGModal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="GFF comparison file picker modal"
      >
        <div className="vf-stack vf-stack--800">
          <h1>Compare a GFF to the contig</h1>
          <form className="vf-stack vf-stack--400" action="#" method="get">
            <div className="vf-form__item vf-stack">
              <label
                htmlFor="upload-picker"
                className="vf-form__label vf-form__label--required"
              >
                <h2>Upload a GFF file from your computer</h2>
              </label>

              <p className="vf-form__helper">
                The GFF will be stored in your browser, not sent to MGnify
                servers.
              </p>
              <FileUploaderButton
                onChange={(e) =>
                  addGff((e.target as unknown as HTMLInputElement).files[0])
                }
                accept=".gff,.gff3"
              />
              {uploadError && (
                <p className="vf-form__helper vf-form__helper--error">
                  {uploadError}
                </p>
              )}
            </div>
          </form>
          <div className="vf-stack vf-stack--200">
            <h2>Previously uploaded GFFs</h2>
            <p className="vf-form__helper">
              Click the GFF’s name to view it in the browser
            </p>
            <PlainTable cols={columns} data={gffs} />
          </div>
        </div>
      </EMGModal>
      {!!gffComparisonId && !!igvBrowser && (
        <div>
          <p className="vf-text-body vf-text-body--2">
            Semiquantitative expression spectrum count
            <p className="vf-text-body vf-text-body--4">
              Scaled against the maximum in this study
            </p>
          </p>

          <div className="colorBarWrapper">
            0
            <div className="colorBar" />
            {Math.round(colorBarMax)}
          </div>
        </div>
      )}
      <button
        className="vf-button vf-button--secondary vf-button--sm"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Load a GFF
      </button>
    </div>
  );
};

export default GFFCompare;
