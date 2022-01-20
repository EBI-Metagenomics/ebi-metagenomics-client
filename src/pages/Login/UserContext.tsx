import React from 'react';
import { noop } from 'lodash-es';

type UserType = {
  username: null | string;
  isAuthenticated: boolean;
};
export type UserDetail = {
  type: string;
  id: string;
  attributes: {
    'first-name': string;
    surname: string;
    'email-address': string;
    analysis: boolean;
    submitter: boolean;
  };
};
export type UserDetails = Array<UserDetail>;

const UserContext = React.createContext({
  username: null,
  isAuthenticated: false,
  details: null,
  config: null,
  setUser: noop as (u: UserType) => void,
  setDetails: noop as (details: UserDetails) => void,
});

export const getEmailsFromDetails = (details: UserDetails): string[] =>
  details.map(({ attributes: { 'email-address': email } }) => email);

export const getDetailsByWebin = (
  details: UserDetails,
  webin: string
): UserDetail => details.find(({ id }) => id === webin);

export default UserContext;
