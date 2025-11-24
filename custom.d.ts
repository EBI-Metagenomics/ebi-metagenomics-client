declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.json' {
  const file: any;
  export default file;
}
declare module '*.svg' {
  const file: any;
  export default file;
}
declare module '*.jpg' {
  const file: any;
  export default file;
}
declare module '*.gif' {
  const file: any;
  export default file;
}
declare module '*.png' {
  const file: any;
  export default file;
}
declare module '*.txt' {
  const file: any;
  export default file;
}

declare global {
  declare namespace JSX {
    interface IntrinsicElements {
      'textarea-sequence': TextareaSequenceProps;
      'mgnify-sourmash-component': MGnifySourmashComponentProps;
    }
  }

  interface HTMLElementTagNameMap {
    'textarea-sequence': TextareaSequenceElement;
  }

  interface TextareaSequenceElement extends HTMLElement {
    quill: any;
    cleanUp(): void;
    sequence: string;
  }

  interface TextareaSequenceProps
    extends React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > {
    height: string;
    single: 'true' | 'false';
    alphabet: string;
  }

  interface MGnifySourmashComponentProps
    extends React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > {
    id: string;
    show_directory_checkbox: boolean;
  }

  interface ImportMeta {
    env: {
      BASE_URL: string;
    };
  }
}

declare module 'igv' {
  export type Browser = {
    trackViews: any[];
    on: (
      event: string,
      callback: (
        track: any,
        data: { name: string; value: string | number }[]
      ) => unknown
    ) => void;
    search: (searchTerm: string) => void;
    loadTrack: (trackConfig: unknown) => void;
    removeTrackByName: (trackName: string) => void;
    findTracks: (attr: string, val: string) => any;
  };
  const igv: {
    createBrowser: (element: unknown, options: unknown) => Promise<Browser>;
  };
  export default igv;
}

declare module 'igv/dist/igv.esm' {
  export * from 'igv';
  export { default } from 'igv';
}

import 'react-table';

declare module 'react-table' {
  export interface TableInstance<D extends object = {}>
    extends UseSortByInstanceProps<D>,
      UsePaginationInstanceProps<D> {}

  export interface TableState<D extends object = {}>
    extends UseSortByState<D>,
      UsePaginationState<D> {}

  export interface TableOptions<D extends object = {}>
    extends UseSortByOptions<D>,
      UsePaginationOptions<D> {}

  export interface ColumnInterface<D extends object = {}> {
    isFullWidth?: boolean; // custom prop we use for e.g. text search page
    colspan?: number | ((cell: Cell<D>) => number);
    className?: string;
    style?: import('react').CSSProperties;
  }

  export interface ColumnInstance<D extends object = {}>
    extends UseSortByColumnProps<D> {
    isFullWidth?: boolean;
    colspan?: number | ((cell: Cell<D>) => number);
    className?: string;
    style?: import('react').CSSProperties;
  }
}

export {};
