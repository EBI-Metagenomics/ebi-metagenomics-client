import { Component, lazy, ReactNode, Suspense, useRef, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import config from 'utils/config';
import Tooltip from 'components/UI/Tooltip';
import EMGModal from 'components/UI/EMGModal';
import EMGTable from 'components/UI/EMGTable';
import { Pencil } from 'lucide-react';
import './style.css';

const KetcherInput = lazy(() => import('./KetcherInput'));
const CAFFEINE_SMILES = 'Cn1c(=O)c2c(ncn2C)n(C)c1=O';

class EditorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <p role="alert">
        Cannot load the structure editor. Refresh this page to try again, or use
        SMILES or molecule-name search.
      </p>
    ) : (
      this.props.children
    );
  }
}
type Compound = { chebi_id: string; name: string; smiles: string };
type Molecule = { chebi_id: string; score: number };
type Hit = {
  analysis: string;
  assembly: string;
  molecules: Molecule[];
};
type Results = {
  items: Hit[];
  molecules: Molecule[];
  truncated: boolean;
  next_cursor: number | null;
};
const endpoint = `${config.api_v2.replace(/\/$/, '')}/molecule-search`;

const moleculeColumns: ColumnDef<Molecule>[] = [
  {
    header: 'Molecule',
    accessorKey: 'chebi_id',
    cell: ({ row }) => (
      <a href={`https://www.ebi.ac.uk/chebi/${row.original.chebi_id}`}>
        {row.original.chebi_id}
      </a>
    ),
  },
  {
    header: 'Similarity',
    accessorKey: 'score',
    cell: ({ row }) => row.original.score.toFixed(3),
  },
];

const analysisColumns: ColumnDef<Hit>[] = [
  {
    header: 'Analysis',
    accessorKey: 'analysis',
    cell: ({ row }) => (
      <Link to={`/analyses/${row.original.analysis}/functional?type=rhea`}>
        {row.original.analysis}
      </Link>
    ),
  },
  { header: 'Assembly', accessorKey: 'assembly' },
  {
    header: 'Matched molecules',
    accessorKey: 'molecules',
    cell: ({ row }) =>
      row.original.molecules.map((molecule, index) => (
        <span key={molecule.chebi_id}>
          {index > 0 && ', '}
          <Link
            to={`/analyses/${
              row.original.analysis
            }/functional?${new URLSearchParams({
              type: 'rhea',
              chebi: molecule.chebi_id,
            })}`}
            title={`Find ${molecule.chebi_id} in this analysis's Rhea table`}
          >
            {molecule.chebi_id}
          </Link>
        </span>
      )),
  },
  {
    header: 'Best similarity',
    id: 'similarity',
    accessorFn: (hit) => hit.molecules[0].score,
    cell: ({ row }) => row.original.molecules[0].score.toFixed(3),
  },
];

async function readResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      typeof error?.detail === 'string'
        ? error.detail
        : 'Molecule search failed. Please try again.'
    );
  }
  return response.json();
}

export default function MoleculeSearch() {
  const [smiles, setSmiles] = useState('');
  const [draw, setDraw] = useState(false);
  const [result, setResult] = useState<Results | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitted = useRef('');
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lookupAbort = useRef<AbortController | null>(null);

  async function search(value: string, after = 0) {
    if (!value.trim() || busy) return;
    setBusy(true);
    setError('');
    if (!after) setResult(null);
    try {
      const data = await readResponse(
        await fetch(`${endpoint}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ smiles: value.trim(), after }),
        })
      );
      submitted.current = value.trim();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mg-molecule-search">
      <h2>Search by molecule</h2>
      <p>
        Find assembly analyses with predicted protein reactions involving
        similar molecules.
      </p>
      <label className="vf-form__label" htmlFor="molecule-name">
        Find a molecule by name or ChEBI ID
      </label>
      <AsyncSelect<Compound>
        inputId="molecule-name"
        cacheOptions
        placeholder="For example, caffeine or CHEBI:27732"
        getOptionLabel={(option) => `${option.name} (${option.chebi_id})`}
        getOptionValue={(option) => option.chebi_id}
        loadOptions={(term, callback) => {
          clearTimeout(debounce.current);
          lookupAbort.current?.abort();
          if (term.trim().length < 2) {
            callback([]);
            return;
          }
          debounce.current = setTimeout(async () => {
            const controller = new AbortController();
            lookupAbort.current = controller;
            try {
              const response = await fetch(
                `${endpoint}/compounds?term=${encodeURIComponent(term)}`,
                { signal: controller.signal }
              );
              callback(await readResponse(response));
            } catch (err) {
              if ((err as Error).name !== 'AbortError') {
                setError((err as Error).message);
                callback([]);
              }
            }
          }, 300);
        }}
        onChange={(compound) => {
          setSmiles(compound?.smiles || '');
          setDraw(false);
        }}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          search(smiles);
        }}
      >
        <div className="mg-molecule-input-heading">
          <label className="vf-form__label" htmlFor="molecule-smiles">
            SMILES
          </label>
          <Tooltip content="SMILES describes a molecular structure. Read more on Wikipedia.">
            <a
              href="https://en.wikipedia.org/wiki/Simplified_Molecular_Input_Line_Entry_System"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="About SMILES"
            >
              <span
                className="icon icon-common icon-info tooltip-icon"
                aria-hidden="true"
              />
            </a>
          </Tooltip>
          <button
            type="button"
            className="vf-button vf-button--link vf-button--sm"
            onClick={() => {
              setSmiles(CAFFEINE_SMILES);
              setDraw(false);
            }}
          >
            Use example: caffeine
          </button>
          <button
            type="button"
            className="vf-button vf-button--link vf-button--sm"
            aria-haspopup="dialog"
            onClick={() => setDraw(true)}
          >
            <Pencil size={14} aria-hidden="true" />
            Draw a molecule
          </button>
        </div>
        <textarea
          id="molecule-smiles"
          className="vf-form__input"
          rows={3}
          maxLength={4000}
          value={smiles}
          onChange={(event) => setSmiles(event.target.value)}
        />
        <button
          className="vf-button vf-button--primary vf-button--sm"
          disabled={busy || !smiles.trim()}
        >
          {busy ? 'Searching…' : 'Search similar molecules'}
        </button>
      </form>
      <EMGModal
        isOpen={draw}
        onRequestClose={() => setDraw(false)}
        contentLabel="Draw a molecule"
      >
        {draw && (
          <>
            <h2>Draw a molecule</h2>
            <EditorBoundary>
              <Suspense fallback={<p>Loading structure editor…</p>}>
                <KetcherInput
                  smiles={smiles}
                  onSearch={(value) => {
                    setSmiles(value);
                    setDraw(false);
                    search(value);
                  }}
                />
              </Suspense>
            </EditorBoundary>
          </>
        )}
      </EMGModal>
      {error && <p role="alert">{error}</p>}
      <p>
        Similarity threshold: 0.8. Up to 100{' '}
        <a
          href="https://idsm.elixir-czech.cz/sparql/endpoint/chebi"
          target="_blank"
          rel="noopener noreferrer"
        >
          ChEBI
        </a>{' '}
        molecules from{' '}
        <a
          href="https://idsm.elixir-czech.cz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          IDSM
        </a>
        .
      </p>
      <p>
        These annotations do not demonstrate molecule presence or enzyme
        activity.
      </p>
      {result && (
        <div aria-live="polite">
          {result.truncated && (
            <p>
              The molecule list reached its limit. Results cover the first 100
              matches.
            </p>
          )}
          <p>
            {result.molecules.length} matching molecules. {result.items.length}{' '}
            assembly analyses on this page.
          </p>
          <details open className="mg-molecule-candidates">
            <summary>
              Molecules searched from IDSM ({result.molecules.length})
            </summary>
            <p>
              All listed molecules are included in the search. Some may have no
              indexed assembly matches.
            </p>
            <div className="mg-molecule-candidate-list">
              <EMGTable
                cols={moleculeColumns}
                data={result.molecules}
                Title="Molecules searched from IDSM"
                namespace="moleculeCandidates"
                showPagination={false}
              />
            </div>
          </details>
          <EMGTable
            cols={analysisColumns}
            data={result.items}
            namespace="moleculeAnalyses"
            showPagination={false}
            horizontalScroll
            emptyStateMessage="No indexed assembly analyses match this search."
          />
          <button
            type="button"
            className="vf-button vf-button--secondary vf-button--sm"
            disabled={busy}
            onClick={() => search(submitted.current)}
          >
            First page
          </button>
          {result.next_cursor !== null && (
            <button
              type="button"
              className="vf-button vf-button--secondary vf-button--sm"
              disabled={busy}
              onClick={() => search(submitted.current, result.next_cursor!)}
            >
              Next page
            </button>
          )}
        </div>
      )}
      <p>Search covers imported public ASAv6 assembly analyses.</p>
    </section>
  );
}
