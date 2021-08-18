import React from 'react';

type UserType = {
  username: null | string;
  isAuthenticated: boolean;
};
const UserContext = React.createContext({
  username: null,
  isAuthenticated: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  setUser: (u: UserType) => null,
});

export default UserContext;
