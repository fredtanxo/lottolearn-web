import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import Cookies from 'js-cookie';

import LoginLayout from '../layout/login';

import { login } from '../../api/auth';
import config from '../../config';

export default () => {
  if (sessionStorage.getItem(config.accessTokenKey)) {
    return (<Redirect to={{ pathname: '/' }} />)
  }

  const [loading, setLoading] = useState(false);
  const [trying, setTrying] = useState(false);

  const requestLogin = params => {
    if (trying) {
      return;
    }
    setTrying(true);
    setLoading(true);
    login(params).then(async response => {
      if (response.status === 200) {
        const json = await response.json();
        Cookies.set(config.accessTokenKey, json[config.accessTokenKey], {
          path: '/',
          domain: 'lottolearn.com',
          // expires: 
        });
        sessionStorage.setItem(config.accessTokenKey, json[config.accessTokenKey]);
        window.location.href = '/';
      } else if (response.status === 401) {
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
    .catch(error => message.error('网络异常'))
    .finally(() => {
      setTrying(false)
      setLoading(false)
    });
  };

  return (
    <LoginLayout>
      <div style={{ width: '365px' }}>
        <div className="logo-wrapper">
          <img
            src={`${process.env.PUBLIC_URL}/logo-web.png`}
            width="150"
            alt="LotToLearn System Management"
          />
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
      </div>
    </LoginLayout>
  );
};
