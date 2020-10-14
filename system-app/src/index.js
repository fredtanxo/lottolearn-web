import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

import Cookies from 'js-cookie';

import './index.css';
import App from './App';
import api from './api';
import config from './config';

import { updateCurrentUserRoles } from './actions/auth';

const store = createStore(reducers, applyMiddleware(thunk.withExtraArgument(api)));

// 确保React实例加载前已经获得access_token并存入sessionStorage
new Promise((resolve, reject) => {
  const accessToken = Cookies.get(config.accessTokenKey)
  sessionStorage.removeItem(config.accessTokenKey)
  if (accessToken) {
    sessionStorage.setItem(config.accessTokenKey, accessToken)
    resolve()
  } else {
    reject()
  }
})
.catch(async () => {
  const response = await api.auth.refresh();
  if (response.status === 200) {
    const json = await response.json();
    Cookies.set(config.accessTokenKey, json[config.accessTokenKey], {
      path: '/',
      domain: 'lottolearn.com',
      // expires: new Date(json['access_token_expiration'])
    });
    sessionStorage.setItem(config.accessTokenKey, json[config.accessTokenKey]);
  }
})
.catch(() => { /* do nothing, just avoid warnings */ })
.then(async () => {
  const response = await api.auth.currentUserRoles();
  if (response.data) {
    const payload = response.data['payload'];
    if (payload) {
      const data = payload['data'];
      store.dispatch(updateCurrentUserRoles(data))
    }
  }
})
.finally(() => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );
});
