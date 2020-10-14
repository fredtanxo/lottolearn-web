import React, { useEffect, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';

import Cookies from 'js-cookie';

import { Layout, Menu, Dropdown, Avatar } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  DatabaseOutlined,
  MonitorOutlined
} from '@ant-design/icons';

import config from '../../config';
import { logout } from '../../api/auth';

import './layout.css';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const AppLayout = ({ children, history, user, updateCurrentUser }) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => updateCurrentUser(), [updateCurrentUser]);

  const requestLogout = () => {
    Cookies.remove(config.accessTokenKey, {
      path: '/',
      domain: 'lottolearn.com'
    });
    sessionStorage.removeItem(config.accessTokenKey);
    logout().finally(() => window.location.href = '/');
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={requestLogout}>
        <span>退出登录</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsed={collapsed}
        onCollapse={collapsed => setCollapsed(collapsed)}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div className="logo">
          <h2>{collapsed ? 'LTL' : 'LotToLearn'}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultOpenKeys={[`/${history.location.pathname.split('/')[1]}`]}
          selectedKeys={[history.location.pathname]}
        >
          <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
            <Link to="/dashboard">系统数据</Link>
          </Menu.Item>
          <SubMenu key="/members" icon={<UserOutlined />} title="用户与权限">
            <Menu.Item key="/members/user">
              <Link to="/members/user">用户管理</Link>
            </Menu.Item>
            <Menu.Item key="/members/role">
              <Link to="/members/role">角色管理</Link>
            </Menu.Item>
            <Menu.Item key="/members/menu">
              <Link to="/members/menu">菜单管理</Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="/storage" icon={<DatabaseOutlined />}>
            <Link to="/storage">文件与存储</Link>
          </Menu.Item>
          <Menu.Item key="/syslogs" icon={<MonitorOutlined />}>
            <Link to="/syslogs">日志与监控</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header className="site-header" style={{ padding: 0 }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger-button',
            onClick: () => setCollapsed(!collapsed)
          })}
          <Dropdown overlay={menu} trigger={['click']}>
            <div style={{ float: 'right', marginRight: 20, cursor: 'pointer' }}>
              <Avatar
                size={32}
                src={user.avatar}
                style={{ marginTop: -4 }}
              />
              <span style={{ marginLeft: 10 }}>{user.nickname}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          2020 Created by Fred
        </Footer>
      </Layout>
    </Layout>
  );
};

export default withRouter(AppLayout);
