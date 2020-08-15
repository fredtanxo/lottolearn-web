import React from 'react';

import { Button, Table, Tooltip, Space, Popconfirm } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';

const RoleTable = ({ data, loading, startModifyRole, closeRole }) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '名称',
      dataIndex: 'name',
      render: (name, record) => (
        <Tooltip
          title={
            <React.Fragment>
              <span>创建：{record['createdBy']} - {record['createdAt']}</span><br />
              <span>修改：{record['updatedBy']} - {record['updatedAt']}</span>
            </React.Fragment>
          }
        >
          <span>{name}</span>
        </Tooltip>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: '5em',
      render: status => status ? <span>活跃</span> : <span>停用</span>
    },
    {
      title: '操作',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => startModifyRole(record['id'])}>
            修改
          </Button>
          {record['status'] ? (
            <Popconfirm
              title={`停用角色 ${record['name']}？`}
              icon={<QuestionCircleFilled style={{ color: 'red' }} />}
              onConfirm={() => closeRole(record['id'])}
              okText="停用"
              okButtonProps={{ danger: true }}
              cancelText="取消"
            >
              <Button type="link" danger>停用</Button>
            </Popconfirm>
          ) : (<span></span>)}
        </Space>
      )
    }
  ];

  return (
    <div className="site-content-background" style={{ marginTop: 20, padding: 24 }}>
      <Table loading={loading} columns={columns} dataSource={data} rowKey="id" />
    </div>
  )
};

export default RoleTable;
