const absInfoDictionary = {
  1: {
    suffixText: 'has ABS obligations',
    badgeText: 'ABS LAWS',
  },
  2: {
    suffixText: 'will have ABS obligations in the future',
    badgeText: 'UPCOMING',
  },
  3: {
    suffixText: 'does not have ABS obligations',
    badgeText: 'NO ABS',
  },
  4: {
    suffixText: 'has unclear ABS obligations',
    badgeText: 'UNCLEAR',
  },
  5: {
    suffixText: 'has ABS obligations but revision is in progress',
    badgeText: 'IN REVISION',
  },
};

export const displayAbsInfo = (eezData: EezMetadata) => {
  if (eezData.hasMultipleSovereigns) {
    let htmlOutput = ` <p>\n This EEZ falls within the sovereignty of ${eezData.sovereigns.length} nations:\n</p>`;
    // eslint-disable-next-line array-callback-return
    eezData.sovereigns.map((sovereign: Sov) => {
      const absInfo = absInfoDictionary[sovereign.absStatus];
      htmlOutput += ` <div class="vf-meta__details">
                  <p>
                  ${sovereign.name}:
                    <span
                      class="vf-badge vf-badge--${
                        sovereign.absStatus === 1 ? 'secondary' : 'tertiary'
                      }"
                    >
                      <abbr
                        title="Access and Benefit Sharing"
                        class="eez-abbr"
                      >
                        ${absInfo.badgeText}
                      </abbr>
                    </span>
                    ${sovereign.name} ${absInfo.suffixText}
                  </p>
                </div>`;
    });
    return htmlOutput;
  }
  const sovereign = eezData.sovereigns[0];
  const absInfo = absInfoDictionary[sovereign.absStatus];
  return ` <div class="vf-meta__details">
                  <p>
                    <span
                      class="vf-badge vf-badge--${
                        sovereign.absStatus === 1 ? 'secondary' : 'tertiary'
                      }"
                    >
                      <abbr
                        title="Access and Benefit Sharing"
                        class="eez-abbr"
                      >
                       ${absInfo.badgeText}
                      </abbr>
                    </span>
                  This EEZ is under the sovereignty of ${sovereign.name}. ${
    sovereign.name
  } ${absInfo.suffixText}
                  </p>
                </div>`;
};

export type Sov = { name: string; absStatus: number };

export type SovereignsArray = Sov[];

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
