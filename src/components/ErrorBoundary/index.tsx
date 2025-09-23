import React, { PropsWithChildren } from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  PropsWithChildren<unknown>,
  State
> {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error | null): {
    error: Error | null;
  } {
    return { error };
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;
    if (error) {
      console.error(error);
      return (
        <div
          className="vf-box vf-box-theme--primary vf-box--easy"
          style={{
            backgroundColor: 'lemonchiffon',
          }}
        >
          <h3 className="vf-box__heading">
            <span className="icon icon-common icon-exclamation-triangle" />{' '}
            General Error
          </h3>
          <p className="vf-box__text">
            Something went wrong while loading this page. Please refresh the
            page and if the error persist, let us know at{' '}
            <a href="mailto:metagenomics-help@ebi.ac.uk">
              metagenomics-help@ebi.ac.uk
            </a>
          </p>
          <div className="mg-right">
            <button
              type="button"
              className="vf-button vf-button--tertiary vf-button--sm "
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
