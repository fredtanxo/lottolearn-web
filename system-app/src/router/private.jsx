import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import config from '../config';

export default ({ permit, children, ...rest}) => {
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (!sessionStorage.getItem(config.accessTokenKey)) {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: location }
              }}
            />
          );
        }
        if (!permit) {
          return (
            <Redirect
              to={{
                pathname: '/forbidden',
                state: { from: location }
              }}
            />
          );
        }
        return children;
      }}
    />
  );
};
