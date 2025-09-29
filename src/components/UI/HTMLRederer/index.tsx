const HTMLRenderer = ({ htmlContent }) => (
  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
);

export default HTMLRenderer;
