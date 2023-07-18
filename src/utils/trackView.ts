export type TrackView = {
  id: string;
  track: {
    id: string;
    config: {
      label: string;
      initialCrateUrl: string;
      crate: {
        tree: {
          name: [];
        };
      };
    };
  };
};
