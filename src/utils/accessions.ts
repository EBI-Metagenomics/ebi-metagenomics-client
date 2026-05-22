export const studyAccessionPattern = /^MGYS[0-9]{8}$/;

export const analysisAccessionPattern = /^MGYA[0-9]{8}$/;

export const genomeAccessionPattern = /^MGYG[0-9]{9}$/;

export const mgnifyAccessionPattern = /^MGY[AGSP]{1}[0-9]{1,12}$/;

export type DetailOrSearchURLType = {
  isAccessionLike: boolean;
  nextURL: string;
  resourceOfType: string;
};

export const getDetailOrSearchURLForQuery = (
  str: string
): DetailOrSearchURLType => {
  if (str.match(mgnifyAccessionPattern)) {
    if (str.match(studyAccessionPattern)) {
      return {
        isAccessionLike: true,
        nextURL: `/studies/${str}`,
        resourceOfType: 'Study',
      };
    }
    if (str.match(analysisAccessionPattern)) {
      return {
        isAccessionLike: true,
        nextURL: `/analyses/${str}`,
        resourceOfType: 'Analysis',
      };
    }
    if (str.match(genomeAccessionPattern)) {
      return {
        isAccessionLike: true,
        nextURL: `/genomes/${str}`,
        resourceOfType: 'Genome',
      };
    }
  }
  return {
    isAccessionLike: false,
    nextURL: `/search/studies?query=${encodeURIComponent(str)}`,
    resourceOfType: 'Search',
  };
};
