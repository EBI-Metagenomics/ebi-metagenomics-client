import React from 'react';
import { Download } from '@/interfaces';

const AdditionalGffNotice: React.FC<{ additionalGffs: Download[] }> = ({
  additionalGffs,
}) => {
  if (additionalGffs.length === 0) return null;

  return (
    <div
      className="vf-box vf-box-theme--primary vf-box--easy"
      style={{
        backgroundColor: '#d1e3f6',
      }}
    >
      <div className="vf-flag vf-flag--top vf-flag--reversed vf-flag--800">
        <div className="vf-flag__body">
          <p className="vf-text-body vf-text-body--3">
            Additional GFFs shown are not searchable, but can be downloaded
          </p>
          <ul className="vf-list vf-list--bare">
            {additionalGffs.map((d) => (
              <li key={d.alias || d.url}>
                <p className="vf-text-body vf-text-body--4">
                  {d.short_description}:{' '}
                  <a
                    href={d.url}
                    className="vf-link vf-link--primary vf-link--underline"
                  >
                    {d.alias || d.url}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdditionalGffNotice;
