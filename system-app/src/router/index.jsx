import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import PrivateRoute from '../containers/router/private';

import Login from '../components/login';
import Forbidden from '../components/error/forbidden';

import Dashboard from '../components/dashboard';
import User from '../components/members/user';
import Role from '../components/members/role';
import Menu from '../components/members/menu';
import Storage from '../components/storage';
import SysLog from '../components/syslog';
import NotFound from '../components/error/notfound';
import AppLayout from '../containers/layout';

const AppRouter = () => {
  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/forbidden">
        <Forbidden />
      </Route>
      <PrivateRoute exact path="/">
        <Redirect to="/dashboard" />
      </PrivateRoute>
      <PrivateRoute path="/dashboard">
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute exact path="/user">
        <Redirect to="/members/user" />
      </PrivateRoute>
      <PrivateRoute path="/members/user">
        <AppLayout>
          <User />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="/members/role">
        <AppLayout>
          <Role />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="/members/menu">
        <AppLayout>
          <Menu />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="/storage">
        <AppLayout>
          <Storage />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="/syslogs">
        <AppLayout>
          <SysLog />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="*">
        <NotFound />
      </PrivateRoute>
    </Switch>
  );
};

export default AppRouter;
