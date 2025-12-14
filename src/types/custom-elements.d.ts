declare namespace JSX {
  interface IntrinsicElements {
    'mgnify-sourmash-component': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      show_directory_checkbox?: boolean;
    };
  }
}

type HTMLMgnifySourmashComponentElement = HTMLElement & {
  show_directory_checkbox: boolean;
  clear: () => void;
};
