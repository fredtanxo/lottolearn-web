import { connect } from 'react-redux';
import { setModifying, addUser, modifyUser } from '../../../actions/account/user';

import ModifyUser from '../../../components/account/user/modify';

const mapStateToProps = state => ({
  modifying: state.user.modifying,
  modifyingMode: state.user.modifyingMode,
  modifyingTitle: state.user.modifyingTitle,
  modifyingData: state.user.modifyingData,
  roleOptions: state.user.roleOptions,
  userRoles: state.user.userRoles
});

const mapDispatchToProps = dispatch => ({
  setModifying: (mode, title, flag, data, options) => dispatch(setModifying(mode, title, flag, data, options)),
  addUser: params => dispatch(addUser(params)),
  modifyUser: (id, params) => dispatch(modifyUser(id, params))
});

export default connect(mapStateToProps, mapDispatchToProps)(ModifyUser);