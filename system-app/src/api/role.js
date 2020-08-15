import Network from './network';

export const findAllRoles = params => {
  return Network.get('/role/all', params);
};

export const findRoleById = roleId => {
  return Network.get(`/role/id/${roleId}`);
}

export const addRole = params => {
  return Network.post('/row/new', params);
};

export const modifyRole = (roleId, params) => {
  return Network.put(`/role/id/${roleId}`, params);
};

export const closeRole = roleId => {
  return Network.delete(`/role/id/${roleId}`);
};
