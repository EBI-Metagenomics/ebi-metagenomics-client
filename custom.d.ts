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

declare namespace JSX {
  interface IntrinsicElements {
    'textarea-sequence': TextareaSequenceProps;
    'mgnify-sourmash-component': MGnifySourmashComponentProps;
  }
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
