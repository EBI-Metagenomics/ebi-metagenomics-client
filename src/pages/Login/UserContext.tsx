import React from 'react';

type UserType = {
  username: null | string;
  isAuthenticated: boolean;
};
export type UserDetails = Array<{
  type: string;
  id: string;
  attributes: {
    'first-name': string;
    surname: string;
    'email-address': string;
    analysis: boolean;
    submitter: boolean;
  };
}>;
const UserContext = React.createContext({
  username: null,
  isAuthenticated: false,
  details: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  setUser: (u: UserType) => null,
  setDetails: (details: UserDetails) => null,
});

export const getEmailsFromDetails = (details: UserDetails): string[] =>
  details.map(({ attributes: { 'email-address': email } }) => email);

export default UserContext;
