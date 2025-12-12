import React from 'react';

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
  beyondEez?: boolean;
};

export const EezInfo: React.FC<{ eezData: EezMetadata }> = ({ eezData }) => {
  if (!eezData || (!eezData.eezInfoText && !eezData.beyondEez))
    return null as any;
  const prefix = eezData.eezInfoPrefix || '';
  if (eezData.beyondEez) {
    return (
      <div className="vf-meta__details">
        <p>
          <span
            className={`vf-badge vf-badge--${
              eezData.eezBadgeColor || 'tertiary'
            }`}
          >
            <abbr title="Exclusive Economic Zone" className="eez-abbr">
              EEZ Info
            </abbr>
          </span>
          &nbsp;
          {`${prefix} a region beyond an EEZ. While this means there are no national ABS obligations under individual countries' jurisdiction, benefit-sharing obligations may still apply for the use of Marine Genetic Resource (MGR) in areas beyond national jurisdictions, as outlined in the `}
          <a href="https://www.un.org/bbnj/">BBNJ agreement</a>
          {`. Although this agreement is not yet in force, its provisions, including obligations for MGR users, will apply retroactively once enacted.`}
        </p>
      </div>
    );
  }
  return (
    <div className="vf-meta__details">
      <p>
        <span
          className={`vf-badge vf-badge--${eezData.eezBadgeColor || 'primary'}`}
        >
          <abbr title="Exclusive Economic Zone" className="eez-abbr">
            EEZ Info
          </abbr>
        </span>
        &nbsp;
        {eezData.eezInfoText}
      </p>
    </div>
  );
};

export const DisplayAbsInfo: React.FC<{ eezData: EezMetadata }> = ({
  eezData,
}) => {
  if (!eezData) return null as any;

  if (eezData.hasMultipleSovereigns) {
    const count =
      (eezData && eezData.sovereigns && eezData.sovereigns.length) || 0;
    return (
      <>
        <p>
          {`This EEZ falls within the sovereignty of ${
            count || 'unknown'
          } nations:`}
        </p>
        {(eezData.sovereigns || []).map((sovereign: Sov, idx: number) => {
          const absInfo = (absInfoDictionary as any)[
            sovereign && sovereign.absStatus
          ];
          const badgeVariant =
            sovereign && sovereign.absStatus === 1 ? 'secondary' : 'tertiary';
          return (
            <div
              className="vf-meta__details"
              key={`${sovereign && sovereign.name}-${idx}`}
            >
              <p>
                {`${sovereign && sovereign.name}:`}
                <span className={`vf-badge vf-badge--${badgeVariant}`}>
                  <abbr title="Access and Benefit Sharing" className="eez-abbr">
                    {absInfo && absInfo.badgeText}
                  </abbr>
                </span>
                {` ${sovereign && sovereign.name} ${
                  absInfo && absInfo.suffixText
                }`}
              </p>
            </div>
          );
        })}
      </>
    );
  }

  const sovereign = eezData && eezData.sovereigns && eezData.sovereigns[0];
  if (!sovereign) return null as any;
  const absInfo = (absInfoDictionary as any)[sovereign.absStatus];
  const badgeVariant = sovereign.absStatus === 1 ? 'secondary' : 'tertiary';
  return (
    <div className="vf-meta__details">
      <p>
        <span className={`vf-badge vf-badge--${badgeVariant}`}>
          <abbr title="Access and Benefit Sharing" className="eez-abbr">
            {absInfo && absInfo.badgeText}
          </abbr>
        </span>
        {` This EEZ is under the sovereignty of ${sovereign.name}. ${
          sovereign.name
        } ${absInfo && absInfo.suffixText}`}
      </p>
    </div>
  );
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
  beyondEez: false,
};

export default DisplayAbsInfo;
