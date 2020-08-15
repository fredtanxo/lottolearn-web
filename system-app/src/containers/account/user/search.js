import { connect } from 'react-redux';

import { findAllUsers, startAddUser } from '../../../actions/account/user';

import Search from '../../../components/account/user/search';

const mapDispatchToProps = dispatch => ({
  findAllUsers: params => dispatch(findAllUsers(params)),
  startAddUser: () => dispatch(startAddUser())
});

export default connect(null, mapDispatchToProps)(Search);
