import { connect } from 'react-redux';

import { startAddRole, findAllRoles } from '../../../actions/account/role';

import RoleSearch from '../../../components/account/role/search';

const mapDispatchToProps = dispatch => ({
  startAddRole: () => dispatch(startAddRole()),
  findAllRoles: param => dispatch(findAllRoles(param))
});

export default connect(null, mapDispatchToProps)(RoleSearch);
