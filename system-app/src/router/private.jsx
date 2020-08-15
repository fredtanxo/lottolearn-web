import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { checkAuth } from '../utils';

export default ({ children, ...rest}) => {
  return (
    <Route
      {...rest}
      render={({ location }) => 
        checkAuth() ? (children) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};
