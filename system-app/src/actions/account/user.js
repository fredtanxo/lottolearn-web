import { message } from 'antd'

import { mapRolesToOptions, mapBooleanProperties } from '../../utils';

export const setLoading = (loading) => ({
  type: 'SET_LOADING_USER',
  loading
});

export const updateTableData = (query, data) => ({
  type: 'UPDATE_TABLE_DATA_USER',
  query,
  data
});

export const setModifying = (mode, title, modifying, data, roleOptions) => ({
  type: 'SET_MODIFYING_USER',
  mode,
  title,
  modifying,
  data,
  roleOptions
});

export const findAllUsers = params => {
  return (dispatch, getState, api) => {
    dispatch(setLoading(true));
    api.user.findAllUsers(params)
      .then(response => dispatch(updateTableData(params, response.data.payload.data)))
      .catch(err => message.error('无法获取用户信息'))
      .finally(() => dispatch(setLoading(false)));
  };
};

export const startAddUser = () => {
  return (dispatch, getState, api) => {
    const loading = message.loading('正在获取角色信息');
    api.role.findAllRoles()
      .then(response => {
        const options = mapRolesToOptions(response.data.payload.data);
        dispatch(setModifying('ADD', '新增用户', true, {}, options, []))
      })
      .catch(error => message.error('无法获取角色信息'))
      .finally(loading);
  };
};

export const addUser = params => {
  return (dispatch, getState, api) => {
    api.user.addUser(params)
    .then(response => dispatch(setModifying('', '新增用户', false, {})))
    .then(() => message.success('添加成功'))
    .catch(err => message.error('添加失败'))
    .finally(() => dispatch(findAllUsers(getState().user.query)));
  };
};

export const startModifyUser = id => {
  return (dispatch, getState, api) => {
    const loading = message.loading('正在获取用户信息');
    // 并行请求
    const userPromise = api.user.findUserById(id, { withRoles: true });
    const rolePromise = api.role.findAllRoles();
    Promise.all([userPromise, rolePromise])
      .then(results => {
        const user = results[0].data.payload;
        const roles = results[1].data.payload.data;
        mapBooleanProperties(user, ['gender', 'status']);
        const roleOptions = mapRolesToOptions(roles);
        dispatch(setModifying('UPDATE', `正在修改 ${user['nickname']}`, true, user, roleOptions));
      })
      .catch(error => message.error('无法获取用户信息'))
      .finally(loading);
  }
};

export const modifyUser = (id, params) => {
  return (dispatch, getState, api) => {
    api.user.modifyUser(id, params)
      .then(response => {
        message.success('修改成功');
        dispatch(setModifying('', '正在修改', false, {}));
        dispatch(findAllUsers(getState().user.query));
      })
      .catch(error => message.error('修改失败'));
  };
};

export const closeUser = id => {
  return (dispatch, getState, api) => {
    api.user.closeUser(id)
      .then(response => message.success('停用成功'))
      .catch(error => message.error('停用失败'))
      .finally(() => dispatch(findAllUsers(getState().user.query)));
  };
};
