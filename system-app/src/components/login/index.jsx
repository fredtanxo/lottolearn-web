import React, { useState } from 'react';

import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined, WeiboCircleOutlined } from '@ant-design/icons';

import Cookies from 'js-cookie';

import LoginLayout from '../layout/login';

import { login } from '../../api/auth';

export default () => {
  const [loading, setLoading] = useState(false);
  const [trying, setTrying] = useState(false);

  const requestLogin = params => {
    if (trying) {
      return;
    }
    setTrying(true);
    setLoading(true);
    login(params).then(response => {
      if (response.status === 200) {
        const authHeader = response.headers['authorization'];
        const jwt = authHeader.substr("Bearer ".length);
        Cookies.set('token', jwt, { path: '/', domain: 'lottolearn.com' });
        window.location.href = '/';
      }
    })
    .catch(error => {
      if (error.response && error.response.status === 401) {
        // 前端防止恶意登录
        return new Promise(resolve => {
          setTimeout(() => {
            message.error('用户名或密码错误')
            resolve()
          }, 3000)
        })
      } else {
        message.error('网络异常')
      }
    })
    .finally(() => {
      setTrying(false)
      setLoading(false)
    });
  };

  return (
    <LoginLayout>
      <div style={{ width: '365px' }}>
        <div className="logo-wrapper">
          <h2>LotToLearn</h2>
        </div>
        <div className="login-form-wrapper">
          <Form
            size="large"
            onFinish={requestLogin}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '必须提供用户名' }]}
            >
              <Input
                autoFocus
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '必须提供密码' }]}
            >
              <Input
                type="password"
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>
            <Form.Item>
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%' }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className="third-party-wrapper">
          <span style={{ fontSize: 14 }}>社交账号登录</span>
          <span className="third-party-logo-wrapper">
            <button className="third-party-link">
              <GithubOutlined className="third-party-logo third-party-github" />
            </button>
            <button className="third-party-link">
              <WeiboCircleOutlined className="third-party-logo third-party-weibo" />
            </button>
          </span>
        </div>
      </div>
    </LoginLayout>
  );
};
