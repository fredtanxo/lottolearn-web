import React from 'react';

import UserSearch from '../../../containers/account/user/search';
import UserTable from '../../../containers/account/user/table';
import ModifyUser from '../../../containers/account/user/modify';

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
