import React from 'react';

import { Layout } from 'antd';
import './login.css';

const { Content } = Layout;

export default ({ children }) => {
  return (
    <Layout>
      <Content className="login-container">
        {children}
      </Content>
    </Layout>
  );
};
