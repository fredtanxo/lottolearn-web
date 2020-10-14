import React from 'react';

import { Modal, Button, Form, Input, Checkbox, Radio } from 'antd';


const UserModify = ({ modifying, modifyingMode, modifyingTitle, modifyingData, roleOptions, setModifying, addUser, modifyUser }) => {
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 }
  };

  return (
    <Modal
      title={modifyingTitle}
      visible={modifying}
      onOk={() => {}}
      onCancel={() => setModifying('', modifyingTitle, false, {}, [], [])}
      footer={null}
      destroyOnClose
    >
      <Form
        {...layout}
        onFinish={params => {
          if (modifyingMode === 'ADD')
            addUser(params);
          else
            modifyUser(modifyingData['id'], params);
        }}
        initialValues={modifyingData}
      >
        <Form.Item label="用户名称" name="nickname" rules={[{ required: true, message: '必须提供用户名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="用户头像" name="avatar">
          <Input />
        </Form.Item>
        <Form.Item label="用户性别" name="gender">
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="true">男</Radio.Button>
            <Radio.Button value="false">女</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="用户描述" name="description">
          <Input />
        </Form.Item>
        <Form.Item label="用户状态" name="status">
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="true">活跃</Radio.Button>
            <Radio.Button value="false">停用</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="roleIds" label="用户角色">
          <Checkbox.Group options={roleOptions} />
        </Form.Item>
        <Form.Item labelCol={0} wrapperCol={24} style={{ textAlign: 'center' }}>
          <Button type="primary" htmlType="submit">保存</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModify;
