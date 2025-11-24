import React, { Dispatch, SetStateAction } from 'react';
import { noop } from 'lodash-es';
import { ConfigType } from 'utils/config';

export type UserType = {
  username: null | string;
  isAuthenticated: boolean;
  token: null | string;
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

export type UserContextType = UserType & {
  setUser: Dispatch<SetStateAction<UserType | null>>;
  details: UserDetails | null;
  setDetails: Dispatch<SetStateAction<UserDetails | null>>;
  config: ConfigType;
};

const UserContext = React.createContext<UserContextType>({
  username: null,
  isAuthenticated: false,
  details: null,
  config: {} as ConfigType,
  setUser: noop as Dispatch<SetStateAction<UserType | null>>,
  setDetails: noop as Dispatch<SetStateAction<UserDetails | null>>,
  token: null,
});

export const getEmailsFromDetails = (details: UserDetails): string[] =>
  details.map(({ attributes: { 'email-address': email } }) => email);

export const getDetailsByWebin = (
  details: UserDetails,
  webin: string
): UserDetail => {
  return details.find(
    ({ id }) => id.toLowerCase() === webin.toLowerCase()
  ) as UserDetail;
};

export default UserContext;
