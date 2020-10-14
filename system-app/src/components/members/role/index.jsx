import React from 'react';

import RoleSearch from '../../../containers/members/role/search';
import RoleTable from '../../../containers/members/role/table';
import ModifyRole from '../../../containers/members/role/modify';

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
