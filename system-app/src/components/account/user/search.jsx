import React from 'react';

import { Form, Input, Radio, Button, Divider, Col, Row } from 'antd';

const UserSearch = ({ findAllUsers, startAddUser }) => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <div className="site-content-background" style={{ padding: 24 }}>
      <Form
        form={form}
        layout="inline"
        onFinish={params => findAllUsers(params)}
        /* eslint-disable no-useless-computed-key */
        initialValues={{ ['status']: '' }}
      >
        <Row style={{ width: '100%' }}>
          <Col span={8}>
            <Form.Item name="nickname" label="用户名">
              <Input placeholder="用户名" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="用户状态">
              <Radio.Group>
                <Radio.Button value="">全部</Radio.Button>
                <Radio.Button value="true">活跃</Radio.Button>
                <Radio.Button value="false">停用</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Form.Item>
              <Button type="dashed" onClick={handleReset}>重置</Button>
              <Divider type="vertical" />
              <Button onClick={() => startAddUser()}>新增</Button>
              <Divider type="vertical" />
              <Button type="primary" htmlType="submit">查询</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default UserSearch;
