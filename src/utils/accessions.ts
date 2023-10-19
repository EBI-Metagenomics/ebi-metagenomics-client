export const studyAccessionPattern = /^MGYS[0-9]{8}$/;

export const analysisAccessionPattern = /^MGYA[0-9]{8}$/;

export const genomeAccessionPattern = /^MGYG[0-9]{9}$/;

export const mgnifyAccessionPattern = /^MGY[AGSP]{1}[0-9]{1,12}$/;

type DetailOrSearchURLType = {
  isAccessionLike: boolean;
  nextURL: string;
};

export const getDetailOrSearchURLForQuery = (
  str: string
): DetailOrSearchURLType => {
  if (str.match(mgnifyAccessionPattern)) {
    if (str.match(studyAccessionPattern)) {
      return {
        isAccessionLike: true,
        nextURL: `/studies/${str}`,
      };
    }
    if (str.match(analysisAccessionPattern)) {
      return {
        isAccessionLike: true,
        nextURL: `/analyses/${str}`,
      };
    }
    if (str.match(genomeAccessionPattern)) {
      return {
        isAccessionLike: true,
        nextURL: `/genomes/${str}`,
      };
    }
  }
  return {
    isAccessionLike: false,
    nextURL: `/search/studies`,
  };
};
