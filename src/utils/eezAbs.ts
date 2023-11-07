const AbsStatusDictionary = {
  1: {
    text: 'has ABS obligations',
    color: 'secondary',
    badgeText: 'ABS LAWS',
  },
  2: {
    text: 'will have ABS obligations',
    color: 'tertiary',
    badgeText: 'UPCOMING',
  },
  3: {
    text: 'has no ABS obligations',
    color: 'tertiary',
    badgeText: 'NO ABS',
  },
  4: {
    text: 'has unclear ABS obligations',
    color: 'tertiary',
    badgeText: 'UNCLEAR',
  },
  5: {
    text: 'has ABS obligations but revision in progress',
    color: 'tertiary',
    badgeText: 'IN REVISION',
  },
};

export const displayAbsInfo = (eezData: any) => {
  if (eezData.hasMultipleSovereigns) {
    let htmlOutput =
      ' <p>\n This EEZ falls within the jurisdiction of multiple sovereigns:\n</p>';
    // eslint-disable-next-line array-callback-return
    eezData.sovereigns.map((sovereign: any) => {
      const info = AbsStatusDictionary[sovereign.absStatus];
      htmlOutput += ` <div class="vf-meta__details">
                  <p>
                  ${sovereign.name}:
                    <span
                      class="vf-badge vf-badge--${info.color}"
                    >
                      <abbr
                        title="Access and Benefit Sharing"
                        class="eez-abbr"
                      >
                        ${info.badgeText}
                      </abbr>
                    </span>
                    &nbsp;  ${sovereign.name} ${info.text}
                  </p>
                </div>`;
    });
    return htmlOutput;
  }
  const sovereign = eezData.sovereigns[0];
  const info = AbsStatusDictionary[sovereign.absStatus];
  return ` <div class="vf-meta__details">
                  <p>
                    <span
                      class="vf-badge vf-badge--${info.color}"
                    >
                      <abbr
                        title="Access and Benefit Sharing"
                        class="eez-abbr"
                      >
                       ${info.badgeText}
                      </abbr>
                    </span>
                  This EEZ is under the sovereignty of ${sovereign.name}. ${sovereign.name} ${info.text}
                  </p>
                </div>`;
};

export type SovereignsArray = { name: string; absStatus: string }[];

export type EezMetadata = {
  eezInfoPrefix?: string;
  eezInfoText?: string;
  eezName?: string;
  hasAbsObligations?: boolean;
  absInfoText?: string;
  eezBadgeColor?: string;
  absBadgeColor?: string;
  absStatus?: string;
  sovereigns?: SovereignsArray;
  hasMultipleSovereigns?: boolean;
  qualifiesForAbsCheck?: boolean;
};

export const defaultEezMetadata: Partial<Required<EezMetadata>> = {
  eezInfoPrefix: '',
  eezInfoText: '',
  eezName: '',
  hasAbsObligations: false,
  absInfoText: '',
  eezBadgeColor: '',
  absBadgeColor: '',
  absStatus: '',
  sovereigns: [],
  hasMultipleSovereigns: false,
  qualifiesForAbsCheck: false,
};

export default displayAbsInfo;
