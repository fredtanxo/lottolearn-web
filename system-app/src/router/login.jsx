import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Login from '../components/login';

const LoginRouter = () => (
  <Switch>
    <Route path="/login">
      <Login />
    </Route>
  </Switch>
);

export default LoginRouter;