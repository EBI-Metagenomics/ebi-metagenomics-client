import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from 'react-modal';
import {
  db,
  encodeGFF,
  GFF,
} from 'components/Analysis/ContigViewer/GFFCompare/gff_db';
import { useLiveQuery } from 'dexie-react-hooks';
import ArrowForLink from 'components/UI/ArrowForLink';
import PlainTable from 'components/UI/PlainTable';
import { useQueryParametersState } from 'hooks/useQueryParamState';

Modal.setAppElement('#root');

type GFFCompareProps = {
  handleGFFTrack: (gff: GFF) => void;
};

const modalStyle = {
  overlay: {
    zIndex: 10000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const GFFCompare: React.FC<GFFCompareProps> = ({ handleGFFTrack }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState(null);
  const [comparisonQueryParams, setComparisonQueryParams] =
    useQueryParametersState(
      { gffComparisonId: null },
      { gffComparisonId: Number }
    );

  const gffs = useLiveQuery(() => db.gffs.toArray());

  useEffect(() => {
    if (comparisonQueryParams.gffComparisonId) {
      db.gffs.get(comparisonQueryParams.gffComparisonId).then((gff) => {
        if (gff === undefined) {
          setComparisonQueryParams({ gffComparisonId: undefined });
        } else {
          handleGFFTrack(gff);
        }
      });
    }
  }, [comparisonQueryParams, handleGFFTrack, setComparisonQueryParams]);

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
              setComparisonQueryParams({
                ...comparisonQueryParams,
                gffComparisonId: gff.id,
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Example Modal"
        style={modalStyle}
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

              <input
                type="file"
                id="upload-picker"
                hidden
                ref={fileInput}
                onChange={(e) => addGff(e.target.files[0])}
                accept=".gff,.gff3"
              />
              <button
                className="vf-button vf-button--primary vf-button--sm"
                onClick={() => fileInput.current?.click()}
                type="button"
              >
                Browse for file...
              </button>
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
      </Modal>
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