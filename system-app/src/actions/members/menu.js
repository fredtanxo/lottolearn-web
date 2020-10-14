import { message } from 'antd';

import { mapTreeIdToKey } from '../../utils';

export const setLoading = loading => ({
  type: 'SET_LOADING_MENU',
  loading
});

export const updateMenuTree = tree => ({
  type: 'UPDATE_MENU_TREE',
  tree
});

export const findAllMenus = () => {
  return (dispatch, getState, api) => {
    api.menu.findAllMenus()
      .then(response => {
        const data = response.data;
        const tree = data.payload;
        mapTreeIdToKey(tree.children);
        dispatch(updateMenuTree(tree.children))
      })
      .catch(error => message.error('无法获取菜单信息'))
      .finally(() => dispatch(setLoading(false)));
  };
};
