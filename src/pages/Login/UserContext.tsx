import React from 'react';
import { noop } from 'lodash-es';

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
  setUser: noop as (u: UserType) => void,
  setDetails: noop as (details: UserDetails) => void,
});

export const getEmailsFromDetails = (details: UserDetails): string[] =>
  details.map(({ attributes: { 'email-address': email } }) => email);

export default UserContext;
