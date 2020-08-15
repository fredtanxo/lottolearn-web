import Network from './network';

export const findAllUsers = params => {
  return Network.get('/user/all', params);
};

export const findUserById = userId => {
  return Network.get(`/user/id/${userId}`);
};

export const addUser = params => {
  return Network.post('/user/new', params);
};

export const modifyUser = (userId, params) => {
  return Network.put(`/user/id/${userId}`, params);
}

export const closeUser = userId => {
  return Network.delete(`/user/id/${userId}`);
};
