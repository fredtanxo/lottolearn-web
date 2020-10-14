import { connect } from 'react-redux';

import { startModifyRole, closeRole } from '../../../actions/members/role';

import RoleTable from '../../../components/members/role/table';

const mapStateToProps = state => ({
  data: state.role.tableData,
  loading: state.role.loading
});

const mapDispatchToProps = dispatch => ({
  startModifyRole: id => dispatch(startModifyRole(id)),
  closeRole: id => dispatch(closeRole(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleTable);
