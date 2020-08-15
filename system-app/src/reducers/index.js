import { combineReducers } from 'redux';

import auth from './auth';
import user from './user';
import role from './role';
import menu from './menu';

export default combineReducers({
  auth,
  user,
  role,
  menu
});
