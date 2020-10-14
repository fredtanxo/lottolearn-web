import React from 'react';

import UserSearch from '../../../containers/members/user/search';
import UserTable from '../../../containers/members/user/table';
import ModifyUser from '../../../containers/members/user/modify';

const User = () => {
  return (
    <React.Fragment>
      <UserSearch />
      <UserTable />
      <ModifyUser />
    </React.Fragment>
  );
}

export default User;
