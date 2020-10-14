import React from 'react';

import { Button, Divider } from 'antd';

const RoleSearch = ({ startAddRole, findAllRoles }) => {
  const params = [];
  return (
    <div className="site-content-background" style={{ padding: 24, textAlign: 'right' }}>
      <Button onClick={() => startAddRole()}>新增</Button>
      <Divider type="vertical" />
      <Button type="primary" onClick={() => findAllRoles(params)}>查询</Button>
    </div>
  );
};

export default RoleSearch;
