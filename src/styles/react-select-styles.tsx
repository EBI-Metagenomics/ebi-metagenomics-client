export const reactSelectTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  border: '2px solid grey',
  colors: {
    ...theme.colors,
    primary: 'var(--vf-color--blue--dark)',
    primary25: 'var(--vf-color--blue--light)',
    primary50: 'var(--vf-color--blue--light)',
    primary75: 'var(--vf-color--blue)',
    neutral0: 'var(--vf-color--neutral--0)',
    neutral5: 'var(--vf-color--neutral--100)',
    neutral10: 'var(--vf-color--neutral--100)',
    neutral20: 'var(--vf-color--neutral--200)',
    neutral30: 'var(--vf-color--neutral--300)',
    neutral40: 'var(--vf-color--neutral--400)',
    neutral50: 'var(--vf-color--neutral--500)',
    neutral60: 'var(--vf-color--neutral--600)',
    neutral70: 'var(--vf-color--neutral--700)',
    neutral80: 'var(--vf-color--neutral--800)',
    neutral90: 'var(--vf-color--neutral--900)',
    danger: 'var(--vf-color--red)',
    dangerLight: 'var(--vf-color--red--light)',
  },
});

export const reactSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused
      ? '2px solid var(--vf-color--grey--dark)'
      : '2px solid var(--vf-color--grey)',
    boxShadow: state.isFocused
      ? '0 0 0 .0625rem var(--vf-color--grey--dark)'
      : 'unset',
    '&:hover': {
      border: '2px solid var(--vf-color--grey--dark)',
      boxShadow: '0 0 0 .0625rem var(--vf-color--grey--dark)',
    },
    color: state.isFocused
      ? 'var(--vf-color--grey--dark)'
      : 'var(--vf-color--grey)',
  }),
};
