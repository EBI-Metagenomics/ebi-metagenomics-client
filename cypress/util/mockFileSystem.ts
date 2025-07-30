export function mockShowSaveFilePicker(win: Window, filename: string, capture: { content: string[] }) {
  const mockWritableStream = {
    write: cy.stub().callsFake(async (chunk: any) => {
      if (typeof chunk === 'string') {
        capture.content.push(chunk);
      } else if (chunk instanceof Blob) {
        capture.content.push(await chunk.text());
      } else if (chunk instanceof Uint8Array || ArrayBuffer.isView(chunk)) {
        capture.content.push(new TextDecoder().decode(chunk));
      } else if (typeof chunk === 'object' && chunk?.type === 'write') {
        capture.content.push(chunk.data);
      }
    }),
    close: cy.stub().resolves()
  };

  const mockHandle = {
    createWritable: cy.stub().resolves(mockWritableStream),
    kind: 'file',
    name: filename
  };

  cy.stub(win as any, 'showSaveFilePicker')  // as any because method not yet known on Window...
    .as('showSaveFilePicker')
    .returns(Promise.resolve(mockHandle));

  return mockWritableStream;
}