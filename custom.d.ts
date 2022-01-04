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

declare module 'igv' {
  type Browser = {
    on: (
      event: string,
      callback: (
        ignored: boolean,
        data: { name: string; value: string | number }[]
      ) => unknown
    ) => void;
  };
  const igv: {
    createBrowser: (element: unknown, options: unknown) => Promise<Browser>;
  };
  export default igv;
}
