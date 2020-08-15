import React, { useEffect, useState } from 'react';

import { Modal, Button, Form, Input, Radio, Tree } from 'antd';


const UserModify = ({ modifying, modifyingMode, modifyingTitle, modifyingData, setModifying, tree, addRole, modifyRole }) => {
  const [checkedKeys, setCheckedKeys] = useState([])
  const [form] = Form.useForm();

  const handleTreeCheck = values => {
    setCheckedKeys(values);
    form.setFieldsValue({ menuIds: values });
  }

  useEffect(() => {
    if (modifying) {
      setCheckedKeys(modifyingData['menuIds']);
      form.setFieldsValue(modifyingData);
    }
  }, [modifying, modifyingData, form]);

  return (
    <Modal
      title={modifyingTitle}
      visible={modifying}
      onOk={() => {}}
      onCancel={() => setModifying('', modifyingTitle, false, {}, [])}
      footer={null}
      destroyOnClose
      forceRender
    >
      <Form
        form={form}
        onFinish={params => {
          if (modifyingMode === 'ADD')
            addRole(params);
          else
            modifyRole(modifyingData['id'], params);
        }}
      >
        <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '必须提供用户名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="角色描述" name="description">
          <Input />
        </Form.Item>
        <Form.Item label="角色状态" name="status">
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="true">活跃</Radio.Button>
            <Radio.Button value="false">停用</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="角色权限" name="menuIds">
          <Tree
            checkable
            treeData={tree}
            onCheck={values => handleTreeCheck(values)}
            checkedKeys={checkedKeys}
            titleRender={node => <span>{node['name']}</span>}
          />
        </Form.Item>
        <Form.Item style={{ textAlign: 'center' }}>
          <Button type="primary" htmlType="submit">保存</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModify;
