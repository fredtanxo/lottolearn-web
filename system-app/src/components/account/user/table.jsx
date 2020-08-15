import React from 'react';

import { Button, Table, Tooltip, Space, Popconfirm, Avatar } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';

const UserTable = ({ data, loading, startModifyUser, closeUser }) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 96,
      render: (avatar, record) => avatar ? (
        <Avatar size={48} src={avatar} />
      ) : (
        <Avatar size={48}>
          {record['nickname'] ? record['nickname'].charAt(0) : ''}
        </Avatar>
      )
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      render: (nickname, record) => (
        <Tooltip
          title={
            <React.Fragment>
              <span>创建：{record['createdBy']} - {record['createdAt']}</span><br />
              <span>修改：{record['updatedBy']} - {record['updatedAt']}</span>
            </React.Fragment>
          }
        >
          <span>{nickname}</span>
        </Tooltip>
      )
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: '5em',
      render: gender => gender ? <span>男</span> : <span>女</span>
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
          <Button type="link" onClick={() => startModifyUser(record['id'])}>
            修改
          </Button>
          {record['status'] ? (
            <Popconfirm
              title={`停用用户 ${record['nickname']}？`}
              icon={<QuestionCircleFilled style={{ color: 'red' }} />}
              onConfirm={() => closeUser(record['id'])}
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
    <div
      className="site-content-background"
      style={{ marginTop: 20, padding: 24 }}
    >
      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey="id"
        style={{ overflowX: 'auto', overflowY: 'hidden' }}
      />
    </div>
  )
};

export default UserTable;
