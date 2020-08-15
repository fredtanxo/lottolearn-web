import { connect } from 'react-redux';

import { modifyUser, startModifyUser, closeUser } from '../../../actions/account/user';

import UserTable from '../../../components/account/user/table';

const mapStateToProps = state => ({
  data: state.user.tableData,
  loading: state.user.loading
});

const mapDispatchToProps = dispatch => ({
  startModifyUser: id => dispatch(startModifyUser(id)),
  modifyUser: (id, params) => dispatch(modifyUser(id, params)),
  closeUser: id => dispatch(closeUser(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(UserTable);
