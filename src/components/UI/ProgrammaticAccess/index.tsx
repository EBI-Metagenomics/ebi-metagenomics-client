import ExtLink from 'components/UI/ExtLink';
import Box from 'components/UI/Box';
import React, { useContext } from 'react';
import UserContext from '@/pages/Login/UserContext';
import { toast } from 'react-toastify';
import RLogo from 'images/r_logo.svg';
import PythonLogo from 'images/py_logo.svg';

type NotebookLinkProps = {
  notebookPath: string;
  notebookVars?: {
    [varName: string]: string;
  };
  notebookLang: string;
};

type ProgrammaticAccessBoxProps = {
  apiPath: string;
  entityLabel: string;
  notebooks?: NotebookLinkProps[];
};

const ProgrammaticAccessBox: React.FC<ProgrammaticAccessBoxProps> = ({
  apiPath,
  entityLabel,
  notebooks,
}) => {
  const { config } = useContext(UserContext);
  const sayCopied = () =>
    toast.success('Copied API URL to clipboard!', {
      position: 'bottom-left',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  const apiUrl = `${config.api}${apiPath}`;

  return (
    <Box label="Programmatic access">
      <div className="vf-stack">
        <div>
          The{' '}
          <ExtLink href={config.api} className="vf-navigation__link">
            API
          </ExtLink>{' '}
          endpoint for this {entityLabel} is{' '}
          <pre className="vf-code-example__pre" style={{ lineHeight: '3em' }}>
            <a href={apiUrl} target="_blank" rel="noreferrer noopener">
              {apiUrl}
            </a>
            <button
              className="vf-button vf-button--link vf-button--sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(apiUrl);
                sayCopied();
              }}
            >
              <i className="icon icon-common icon-copy" />
            </button>
          </pre>
        </div>
        <div>
          <h5>Analysing data using R or Python</h5>
          <p>
            The{' '}
            <ExtLink
              href={`${config.jupyterLabURL}?jlpath=mgnify-examples/home.ipynb`}
            >
              MGnify Jupyter Lab
            </ExtLink>{' '}
            server hosts examples of data analysis using R and Python. These are
            live examples that you can modify without downloading or installing
            any software.
          </p>
          {notebooks.map((notebook) => {
            let jlLink = `${config.jupyterLabURL}?jlpath=${notebook.notebookPath}`;
            jlLink += Object.entries(notebook.notebookVars || {}).reduce(
              (vars, [varName, varVal]) => `${vars}&jlvar_${varName}=${varVal}`,
              ''
            );
            return (
              <button
                key={notebook.notebookPath}
                className="vf-button vf-button--secondary vf-button--sm"
                type="button"
                onClick={() => window.open(jlLink, '_blank')}
              >
                {notebook.notebookLang === 'R' && (
                  <img
                    src={RLogo}
                    alt="R Project logo"
                    style={{ width: '1em', marginRight: '0.2em' }}
                  />
                )}
                {notebook.notebookLang === 'Python' && (
                  <img
                    src={PythonLogo}
                    alt="Python Language logo"
                    style={{ width: '1em', marginRight: '0.2em' }}
                  />
                )}
                {`Open ${entityLabel} in ${notebook.notebookLang}`}
              </button>
            );
          })}
          {!notebooks.length && (
            <button
              className="vf-button vf-button--secondary vf-button--sm"
              type="button"
              onClick={() => window.open(config.jupyterLabURL, '_blank')}
            >
              Open examples
            </button>
          )}
        </div>
      </div>
    </Box>
  );
};

export default ProgrammaticAccessBox;
