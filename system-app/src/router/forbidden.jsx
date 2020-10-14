import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Forbidden from '../components/error/forbidden';

const LoginRouter = () => (
  <Switch>
    <Route path="/forbidden">
      <Forbidden />
    </Route>
  </Switch>
);

export default LoginRouter;