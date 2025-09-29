// declare namespace JSX {
//   interface IntrinsicElements {
//     'mgnify-sourmash-component': React.DetailedHTMLProps<
//       React.HTMLAttributes<HTMLElement>,
//       HTMLElement
//     > & {
//       show_directory_checkbox?: boolean;
//     };
//   }
// }

type HTMLMgnifySourmashComponentElement = HTMLElement & {
  show_directory_checkbox: boolean;
  clear: () => void;
};

// interface MgnifySourmashComponentAttributes {
//   id?: string;
//   ref?: React.RefObject<any>;
//   show_directory_checkbox: boolean;
// }
//
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       'mgnify-sourmash-component': MgnifySourmashComponentAttributes;
//     }
//   }
// }
