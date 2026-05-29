import React, { Dispatch, SetStateAction } from 'react';
import { noop } from 'lodash-es';
import { ConfigType } from 'utils/config';

export type UserType = {
  username: null | string;
  isAuthenticated: boolean;
  token: null | string;
};

export type UserContextType = UserType & {
  setUser: Dispatch<SetStateAction<UserType | null>>;
  config: ConfigType;
};

const UserContext = React.createContext<UserContextType>({
  username: null,
  isAuthenticated: false,
  config: {} as ConfigType,
  setUser: noop as Dispatch<SetStateAction<UserType | null>>,
  token: null,
});

export default UserContext;
