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
  const igv:{
    createBrowser: (element: unknown, options:unknown)=> Promise<unknown>
  }
  export default igv;
}