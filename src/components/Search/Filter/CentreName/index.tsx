import React from 'react';

const CentreNameFilter: React.FC = () => {
  const tmpID = 'a_cery_uniqueID';
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--400">
      <legend className="vf-form__legend">Centre name</legend>
      <div className="vf-form__item vf-form__item--checkbox">
        <input
          type="checkbox"
          name="emg"
          value="emg"
          id={tmpID}
          className="vf-form__checkbox"
        />
        <label className="vf-form__label" htmlFor={tmpID}>
          EMG
        </label>
      </div>
    </fieldset>
  );
};

export default CentreNameFilter;
