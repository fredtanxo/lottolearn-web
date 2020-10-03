import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import PrivateRoute from './private';

import Login from '../components/login';

import Dashboard from '../components/dashboard';
import User from '../components/account/user';
import Role from '../components/account/role';
import Menu from '../components/account/menu';
import Storage from '../components/storage';
import SysLog from '../components/syslog';
import NotFound from '../components/error/notfound';
import AppLayout from '../components/layout';

const AppRouter = () => {
  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <PrivateRoute exact path="/">
        <Redirect to="/dashboard" />
      </PrivateRoute>
      <PrivateRoute path="/dashboard">
        <AppLayout menuKey={['0', '0']}>
          <Dashboard />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute exact path="/user">
        <Redirect to="/account/user" />
      </PrivateRoute>
      <PrivateRoute path="/account/user">
        <AppLayout menuKey={['1', 'user']}>
          <User />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="/account/role">
        <AppLayout menuKey={['1', 'role']}>
          <Role />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="/account/menu">
        <AppLayout menuKey={['1', 'menu']}>
          <Menu />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="/storage">
        <AppLayout menuKey={['1', 'storage']}>
          <Storage />
        </AppLayout>
      </PrivateRoute>
      <PrivateRoute path="/syslogs">
        <AppLayout menuKey={['1', 'syslog']}>
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
