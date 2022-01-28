import React, { useContext, useEffect, useMemo, useState } from 'react';

import {
  db,
  encodeGFF,
} from 'components/Analysis/ContigViewer/GFFCompare/gff_db';
import { useLiveQuery } from 'dexie-react-hooks';

import ArrowForLink from 'components/UI/ArrowForLink';
import PlainTable from 'components/UI/PlainTable';
import FileUploaderButton from 'components/UI/FileUploaderButton';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import ContigsQueryContext from 'components/Analysis/ContigViewer/ContigsQueryContext';
import { Browser } from 'igv';
import EMGModal from 'components/UI/EMGModal';

type GFFCompareProps = {
  igvBrowser: Browser;
};

const GFFCompare: React.FC<GFFCompareProps> = ({ igvBrowser }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [comparisonQueryParams, setComparisonQueryParams] =
    useQueryParametersState(
      { gff_comparison_id: null },
      { gff_comparison_id: Number }
    );

  const { setQueryParameters, queryParameters } =
    useContext(ContigsQueryContext);

  const gffs = useLiveQuery(() => db.gffs.toArray());

  useEffect(() => {
    if (comparisonQueryParams.gff_comparison_id) {
      db.gffs.get(comparisonQueryParams.gff_comparison_id).then((gff) => {
        if (gff === undefined) {
          setComparisonQueryParams({ gff_comparison_id: null });
        } else {
          igvBrowser.removeTrackByName(gff.name);
          igvBrowser.loadTrack({
            name: gff.name,
            type: 'annotation',
            url: `data:application/octet-stream;base64,${gff.encodedGFF}`,
            format: 'gff3',
            filterTypes: [],
            removable: false,
          });
        }
      });
    }
  }, [comparisonQueryParams, igvBrowser, setComparisonQueryParams]);

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
              setQueryParameters({
                ...queryParameters,
                gff_comparison_id: gff.id,
              });
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
  }, [comparisonQueryParams, setComparisonQueryParams]);

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
        contentLabel="Example Modal"
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
                  addGff((e.target as HTMLInputElement).files[0])
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
