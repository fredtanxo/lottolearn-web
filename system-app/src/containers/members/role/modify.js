import { connect } from 'react-redux';

import { setModifying, addRole, modifyRole } from '../../../actions/members/role';

import ModifyRole from '../../../components/members/role/modify';


const mapStateToProps = state => ({
  modifying: state.role.modifying,
  modifyingMode: state.role.modifyingMode,
  modifyingTitle: state.role.modifyingTitle,
  modifyingData: state.role.modifyingData,
  tree: state.role.menuTree
});

const mapDispatchToProps = dispatch => ({
  setModifying: (mode, title, flag, data, tree) => dispatch(setModifying(mode, title, flag, data, tree)),
  addRole: params => dispatch(addRole(params)),
  modifyRole: (id, params) => dispatch(modifyRole(id, params))
});

export default connect(mapStateToProps, mapDispatchToProps)(ModifyRole);