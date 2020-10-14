import React from 'react';

import { Result } from 'antd';

import AppLayout from '../layout';

const NotFound = () => {
  return (
    <AppLayout>
      <Result
        status="404"
        title="页面不存在"
      />
    </AppLayout>
  );
};

export default NotFound;
