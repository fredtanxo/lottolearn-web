import Network from './network';

export const findAllMenus = () => {
  return Network.get('/menu/all');
};

export const addMenu = params => {
  return Network.post('/menu/new', params);
};

export const updateMenu = (menuId, params) => {
  return Network.put(`/menu/id/${menuId}`, params);
};

export const closeMenu = menuId => {
  return Network.delete(`/menu/id/${menuId}`);
};
