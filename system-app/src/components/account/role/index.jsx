import React from 'react';

import RoleSearch from '../../../containers/account/role/search';
import RoleTable from '../../../containers/account/role/table';
import ModifyRole from '../../../containers/account/role/modify';

const Role = () => {
  return (
    <React.Fragment>
      <RoleSearch />
      <RoleTable />
      <ModifyRole />
    </React.Fragment>
  );
}

export default Role;
