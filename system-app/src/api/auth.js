import Network from './network';

export const login = params => {
  return Network.post('/auth/login', params);
};

export const refresh = () => {
  return Network.post('/auth/refresh');
};

export const logout = () => {
  return Network.delete('/auth/logout');
};

export const currentUser = () => {
  return Network.get('/user/current');
};
