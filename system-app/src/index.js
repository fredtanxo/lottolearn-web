import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

import Cookies from 'js-cookie';

import './index.css';
import App from './App';
import api from './api';

import { updateAuth } from './actions/auth';

const store = createStore(reducers, applyMiddleware(thunk.withExtraArgument(api)));

const token = Cookies.get('token');
sessionStorage.removeItem('token');
if (token) {
  sessionStorage.setItem('token', token);
}

store.dispatch(updateAuth());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
