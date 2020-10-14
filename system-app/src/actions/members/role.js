import { message } from 'antd'
import { mapBooleanProperties, mapTreeIdToKey } from '../../utils';

export const setLoading = (loading) => ({
  type: 'SET_LOADING_ROLE',
  loading
});

export const updateTableData = data => ({
  type: 'UPDATE_TABLE_DATA_ROLE',
  data
});

export const setModifying = (mode, title, modifying, data, tree) => ({
  type: 'SET_MODIFYING_ROLE',
  mode,
  title,
  modifying,
  data,
  tree
});

export const findAllRoles = params => {
  return (dispatch, getState, api) => {
    dispatch(setLoading(true));
    api.role.findAllRoles(params)
      .then(response => dispatch(updateTableData(response.data.payload.data)))
      .catch(error => message.error('无法获取角色信息'))
      .finally(() => dispatch(setLoading(false)));
  };
};

export const startAddRole = () => {
  return (dispatch, getState, api) => {
    const loading = message.loading('正在获取菜单信息');
    api.menu.findAllMenus()
      .then(response => {
        const tree = response.data.payload;
        mapTreeIdToKey(tree.children);
        dispatch(setModifying('ADD', '新增角色', true, {}, tree.children))
      })
      .catch(err => message.error('无法获取菜单信息'))
      .finally(loading);
  };
};

export const addRole = params => {
  return (dispatch, getState, api) => {
    api.role.addRole(params)
      .then(response => dispatch(setModifying('', '新增角色', false, {}, [])))
      .then(() => message.success('增加成功'))
      .catch(error => message.error('增加失败'));
  };
};

export const startModifyRole = id => {
  return (dispatch, getState, api) => {
    const loading = message.loading('正在获取角色信息');
    const rolePromise = api.role.findRoleById(id);
    const menuPromise = api.menu.findAllMenus();
    Promise.all([rolePromise, menuPromise])
      .then(results => {
        const role = results[0].data.payload;
        const tree = results[1].data.payload;
        mapBooleanProperties(role, ['status']);
        mapTreeIdToKey(tree.children);
        dispatch(setModifying('UPDATE', `正在修改 ${role['name']}`, true, role, tree.children));
      })
      .catch(error => message.error('无法获取角色/权限信息'))
      .finally(loading);
  };
};

export const modifyRole = (id, params) => {
  return (dispatch, getState, api) => {
    api.role.modifyRole(id, params)
      .then(response => dispatch(setModifying('', '正在修改', false, {}, [])))
      .then(() => {
        message.success('修改成功')
        dispatch(findAllRoles())
      })
      .catch(error => message.error('修改失败'));
  };
};

export const closeRole = id => {
  return (dispatch, getState, api) => {
    api.role.closeRole(id)
      .then(response => {
        message.success('停用成功')
        dispatch(findAllRoles())
      })
      .catch(error => message.error('停用失败'));
  };
};
