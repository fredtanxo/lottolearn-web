import React from 'react';

import { Button, Result } from 'antd';

import LoginLayout from '../layout/login';

const NotFound = () => {
  return (
    <LoginLayout>
      <Result
        status="403"
        title="权限不足"
        subTitle="你没有权限访问本页面"
        extra={<Button type="primary" href="https://lottolearn.com">返回首页</Button>}
      />
    </LoginLayout>
  );
};

export default NotFound;
