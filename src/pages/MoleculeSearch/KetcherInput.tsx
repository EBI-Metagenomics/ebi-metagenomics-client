import { useRef, useState } from 'react';
import { Editor } from 'ketcher-react';
import { Ketcher } from 'ketcher-core';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import 'ketcher-react/dist/index.css';

export default function KetcherInput({
  smiles,
  onSearch,
}: {
  smiles: string;
  onSearch: (smiles: string) => void;
}) {
  const editor = useRef<Ketcher | null>(null);
  const [provider] = useState(() => new StandaloneStructServiceProvider());
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  return (
    <>
      <div className="mg-molecule-editor">
        <Editor
          staticResourcesUrl={import.meta.env.BASE_URL}
          structServiceProvider={provider}
          errorHandler={(message) => setError(String(message))}
          onInit={async (instance) => {
            editor.current = instance;
            try {
              if (smiles) await instance.setMolecule(smiles);
              setReady(true);
            } catch {
              setError(
                'Cannot load this structure. Clear the drawing or use SMILES input.'
              );
              setReady(true);
            }
          }}
        />
      </div>
      <button
        type="button"
        className="vf-button vf-button--secondary vf-button--sm"
        disabled={!ready}
        onClick={async () => {
          try {
            const value = await editor.current!.getSmiles();
            if (!value.trim()) throw new Error('Empty drawing');
            setError('');
            onSearch(value);
          } catch {
            setError('Draw a molecule before searching.');
          }
        }}
      >
        Search this drawing
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
