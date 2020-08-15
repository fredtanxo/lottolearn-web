import React, { useEffect } from 'react';

import { Tree, Button, Spin } from 'antd';

const MenuTree = ({ loading, tree, findAllMenus }) => {
  useEffect(() => {
    findAllMenus()
  }, [findAllMenus]);

  return (
    <Spin spinning={loading}>
      <div className="site-content-background" style={{ marginTop: 20, padding: 24 }}>
          {tree.length ? (
            <Tree
              selectable={false}
              treeData={tree}
              titleRender={node => (
              <React.Fragment>
                <span>{node['name']}</span>
                <Button type="link" onClick={() => console.log('add' + node['name'])}>增加</Button>
                <Button type="link" onClick={() => console.log('modify' + node['name'])}>修改</Button>
                <Button type="link" danger onClick={() => console.log('close' + node['name'])}>停用</Button>
              </React.Fragment>
            )}
          />) : (<div style={{ minHeight: '50vh' }}></div>)}
      </div>
    </Spin>
  );
};

export default MenuTree;
